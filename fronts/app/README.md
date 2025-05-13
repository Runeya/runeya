# Runeya

[![DeepScan grade](https://deepscan.io/api/teams/10201/projects/12903/branches/207230/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=10201&pid=12903&bid=207230)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=runeya_runeya&metric=alert_status)](https://sonarcloud.io/dashboard?id=runeya_runeya)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=runeya_runeya&metric=code_smells)](https://sonarcloud.io/dashboard?id=runeya_runeya)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=runeya_runeya&metric=bugs)](https://sonarcloud.io/dashboard?id=runeya_runeya)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=runeya_runeya&metric=sqale_index)](https://sonarcloud.io/dashboard?id=runeya_runeya)

Launch multiples command at once. You can monitor projects.(like npm projects, git projects ...)

## Install
``` npm i -g @runeya/runeya ```

## Features
#### Command:
 - Launch multiple commands at once
 - Check in realtime logs produced by command
 - Restart process

#### Git
 - Stash / Stash pop
 - Pull if there is update in branch
 - View branches
 - Change branch
 - Reset branch 
 - Checkout file
 
#### Npm
 - Launch a script
 - Install 
 - Rebuild
 - Log of script in real time
 - Show all dependencies
 - Check if update exist for each dependency

#### Bugs
 - Check problems with typescript

#### Misc
 - Open folder in vscode
 - Open folder in explorer
 - Open Url for micro service
 - Open remote url of git

#### System
 - Show CPU percentage for global system
 - Show Mem percentage for global system
 - Show CPU percentage for each commands
 - Show Mem percentage for each commands

## Usage
Create a config file

Then, in a terminal, type:
``` bash
runeya <path/to/my/config>
```

You can type only ```runeya``` and choose your config file later.

If you change a variable in conf after execution, the corresponding service restart.

## Snippet

Add this in your vscode to print easily variables in debug output of service:
``` json
	"Print to runeya": {
		"prefix": "log",
		"body": [
			"console.log(JSON.stringify(['runeya', $1]));",
			"$2"
		],
		"description": "Print to runeya"
	}
```
Type ```log``` in vs code, it should produce something like that:
``` javascript 
console.log(JSON.stringify(['runeya', <what you want>, <and others>]));
```

Example:

if you type this somewhere in server service: 

```javascript
console.log(JSON.stringify(['runeya', "debug:", {port} ]));
```

Output should appeart in debug section of logs

