var _param = require('./param.json');
var _os = require('os');
var _fs = require('fs');
var _sysconf = require('sysconf');
var _tools = require('graphdat-plugin-tools');

function silent(fnc)
{
	try
	{
		return fnc();
	}
	catch(ex)
	{
		return null;
	}
}

// Returns process id or 0 if not found, -1 if ambiguous, sets reason
var reason;
function findProcId(cfg)
{
	// Get all proc id's
	var procs = _fs.readdirSync('/proc').filter(function(e) { return !isNaN(parseInt(e)); });
	var pidResult = 0;

	var hit;

	procs.every(function(pid)
	{
		var stat = _fs.readFileSync('/proc/' + pid + '/stat', 'utf8').split(' ');
		var cwd = silent(function() { return _fs.readlinkSync('/proc/' + pid + '/cwd'); });
		var path = silent(function() { return _fs.readlinkSync('/proc/' + pid + '/exe'); });

		var re;

		var prc = {
			name : stat[1].substr(1, stat[1].length - 2),
			path : path || '',
			cwd : cwd || ''
		};

		if (cfg.processName)
		{
			re = new RegExp(cfg.processName);
			if (!re.test(prc.name))
				return true;
		}
		if (cfg.processPath)
		{
			re = new RegExp(cfg.processPath);
			if (!re.test(prc.path))
				return true;
		}
		if (cfg.processCwd)
		{
			re = new RegExp(cfg.processCwd);
			if (!re.test(prc.cwd))
				return true;
		}

		// Got a hit, make sure not ambiguous
		if (pidResult)
		{
			reason = 'process ambiguity: ' + JSON.stringify(prc) + ' is too similar to ' + JSON.stringify(hit);
			pidResult = -1;
			return false;
		}
		else
		{
			hit = prc;
			pidResult = pid;
			return true;
		}
	});

	if (!pidResult)
		reason = 'the process was not found';

	return pidResult;
}


var _pollInterval = _param.pollInterval || 1000;
var _hz = _sysconf.get(_sysconf._SC_CLK_TCK);

function pollProcess(prc)
{
	if (!prc.pid || prc.pid <= 0)
		prc.pid = findProcId(prc);

	if (prc.pid <= 0)
	{
		// Couldn't locate, spit out an error once and keep trying
		if (!prc.notified)
		{
			prc.notified = true;
			console.error('Unable to locate process for ' + prc.source + ', ' + reason);
		}
	}
	else
		prc.notified = false;

	if (prc.pid > 0)
	{
		try
		{
			var stat = _fs.readFileSync('/proc/' + prc.pid + '/stat', 'utf8').split(' ');
			var uptime = parseInt(_fs.readFileSync('/proc/uptime', 'utf8').split(' ')[0]);

			var time = (parseInt(stat[13]) + parseInt(stat[14])) / _hz;

			if (prc.lastUp)
			{
				var dtotal = uptime - prc.lastUp;
				var dtime = time - prc.lastTime;

				var p = dtime / dtotal;

				console.log('%s = %d', prc.srouce, p);
			}

			prc.lastUp = uptime;
			prc.lastTime = time;

			//console.log('CPU_PROCESS %d %s', memuse, prc.source);

		}
		catch(ex)
		{
			if (ex.message.indexOf('No such process') != -1)
				prc.pid = 0;
			else
				console.error('Unexpected error for ' + prc.source + ': ' + ex.message);

			console.log('CPU_PROCESS 0 %s', prc.source);
		}
	}
	else
		console.log('CPU_PROCESS 0 %s', prc.source);

}

function poll()
{
	if (_param.items)
		_param.items.forEach(pollProcess);
	else
	{
		console.error('No configuration, exiting');
		process.exit(1);
	}


	setTimeout(poll, _pollInterval);
}

poll();

