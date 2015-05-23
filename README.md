Boundary Process CPU Plugin
---------------------------

Displays CPU usage (%) for specific processes. 

#### For Boundary Meter V4.0
Uses lua pattern to specify a process name. 

#### For Boundary Meter less than V4.0
Uses regular expressions to specify a process name, process full path, and/or the process current working directory. As above, currently only works for Linux based systems that support procfs (i.e. have a /proc directory). **Note**: to monitor processes with elevated priviledges requires running the meter as root, which is not recommended.

### Prerequisites

#### For Boundary Meter V4.0
|     OS    | Linux | Windows | SmartOS | OS X |
|:----------|:-----:|:-------:|:-------:|:----:|
| Supported |   v   |    v    |    v    |  v   |


|  Runtime | node.js | Python | Java |
|:---------|:-------:|:------:|:----:|
| Required |         |        |      |

#### For Boundary Meter less than V4.0
|     OS    | Linux | Windows | SmartOS | OS X |
|:----------|:-----:|:-------:|:-------:|:----:|
| Supported |   v   |    -    |    -    |  -   |


|  Runtime | node.js | Python | Java |
|:---------|:-------:|:------:|:----:|
| Required |    +    |        |      |

- [How to install node.js?](https://help.boundary.com/hc/articles/202360701)

### Plugin Setup
None

#### Plugin Configuration Fields

#### For Boundary Meter V4.0
|Field Name       |Description                                                  |
|:----------------|:------------------------------------------------------------|
|PollInterval     |Interval to query the process                                |
|Items            |Array of items to watch                                      |
|Item Source      |The source to display in the legend for the CPU data.                     |
|Item ProcessName |Pattern to match the name of the process          |
|Item Reconcile   |How to reconcile in the case that multiple processes match.  Set to 'first' (default) to use the first matching process, 'parent' (*nix only) to choose the parent process (useful if process is forked), or 'uptime' (linux only) to pick the process that has been running the longest.          |

#### For Boundary Meter less than V4.0
|Field Name        |Description                                                                                                                                                                                                                                                    |
|:-----------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|Source            |The source to display in the legend for the CPU data.                                                                                                                                                                                                          |
|Process Name Regex|A regular expression to match the name of the process.                                                                                                                                                                                                         |
|Process Path Regex|A regular expression to match the full path of the process.                                                                                                                                                                                                    |
|Process CWD Regex |A regular expression to match the current working directory of the process.                                                                                                                                                                                    |
|Reconcile option  |How to reconcile in the case that multiple processes match.  Set to First Match to use the first matching process, Parent to choose the parent process (useful if process is forked), or Longest Running to pick the process that has been running the longest.|

### Metrics Collected

#### For All Versions
|Metric Name|Description                     |
|:----------|:-------------------------------|
|CPU Process|Process specific CPU utilization|





