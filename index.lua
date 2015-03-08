-- [boundary.com] Process CPU Lua Plugin
-- [author] Ivano Picco <ivano.picco@pianobit.com>

-- Common requires.
local utils = require('utils')
local timer = require('timer')
local fs = require('fs')
local json = require('json')
local os = require ('os')
local tools = require ('tools')

local success, boundary = pcall(require,'boundary')
if (not success) then
  boundary = nil 
end

-- Business requires.
local string = require ("string")
local childProcess = require ('childprocess')
local table = require ('table')

local osType = string.lower(os.type())
local isWindows = osType == 'win32'
local isLinux   = osType == 'linux'

-- Default parameters.
local pollInterval = 15000
local source       = nil

-- Configuration.
local _parameters = (boundary and boundary.param ) or json.parse(fs.readFileSync('param.json')) or {}

_parameters.pollInterval = 
  (_parameters.pollInterval and tonumber(_parameters.pollInterval)>0  and tonumber(_parameters.pollInterval)) or
  pollInterval;

_parameters.source =
  (type(_parameters.source) == 'string' and _parameters.source:gsub('%s+', '') ~= '' and _parameters.source ~= nil and _parameters.source) or
  os.hostname()

-- Back-trail.
local previousValues={}
local currentValues={}

-- Get difference between current and previous time value (format: [dd-]hh:mm:ss).
function diffTimeValues(source,name)
  local _cur  = currentValues[source][name] or 0
  --convert cur value into timestamp
  local t = tools.split(_cur,"-") --days
  local days = (#t>1) and table.remove(t,1) or 0 
  local time = tools.split(t[1],":") -- hours, minutes , seconds
  local cur = (days*24*60*60) + (time[1]*60*60) + (time[2]*60) + time[3]

  local last = previousValues[source][name] or cur or 0
  previousValues[source][name] = cur

  return  (tonumber(cur) - tonumber(last))
end

-- print results
function outputs(cfg)

  utils.print('CPU_PROCESS',(diffTimeValues(cfg.processName, 'time')*1000*100)/_parameters.pollInterval, cfg.source)

end

-- Get current values.
function poll(cfg)
  --get stat
  tools.findProcStat(cfg,
    function (err,proc)
      if (err) then
        --reset previous metrics
        currentValues[cfg.processName]={};
        previousValues[cfg.processName]={};
        utils.debug(err)
        return
      end

      currentValues[cfg.processName] = proc
      outputs(cfg)
    end)

end

-- Ready, go.
if (#_parameters.items >0 ) then
  for _,item in ipairs(_parameters.items) do 
    item.source = item.source or _parameters.source --default hostname
    currentValues[item.processName]={};
    previousValues[item.processName]={};
    poll(item)
    timer.setInterval(_parameters.pollInterval,poll,item)
  end
else
  local source = _parameters.source --default hostname
  currentValues[source]={};
  previousValues[source]={};
  timer.setInterval(_parameters.pollInterval,poll,source)
end

