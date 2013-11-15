var _param = require('./param.json');
var _os = require('os');
var _fs = require('fs');
var _sysconf = require('sysconf');
var _tools = require('graphdat-plugin-tools');

var _pollInterval = _param.pollInterval || 1000;
var _hz = _sysconf.get(_sysconf._SC_CLK_TCK);

function pollProcess(prc)
{
	var pidinfo;

	if (!prc.pid || prc.pid <= 0)
	{
		pidinfo = _tools.findProcId(prc);
		prc.pid = pidinfo.pid;
	}

	if (prc.pid == 0)
	{
		// Couldn't locate, spit out an error once and keep trying
		if (!prc.notified)
		{
			prc.notified = true;
			console.error('Unable to locate process for ' + prc.source + ', ' + pidinfo.reason);
		}
	}
	else
		prc.notified = false;

	if (prc.pid > 0)
	{
		try
		{
			var stat = _fs.readFileSync('/proc/' + prc.pid + '/stat', 'utf8').split(' ');
			var time = (parseFloat(stat[13]) + parseFloat(stat[14]));

			var total = parseFloat(_fs.readFileSync('/proc/uptime', 'utf8').split(' ')[0]) * _hz;

			if (prc.lastTime !== undefined)
			{
				var dtotal = total - prc.lastTotal;
				var dtime = time - prc.lastTime;

				var p = dtime / dtotal;

				console.log('CPU_PROCESS %d %s', p, prc.source);
			}

			prc.lastTotal = total;
			prc.lastTime = time;
		}
		catch(ex)
		{
			if (ex.message.indexOf('ENOENT') != -1)
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

