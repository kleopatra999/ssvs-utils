/*
 * Original Copyright license:
 * Copyright (c) 2014 mrjackdavis
 * Licensed under the MIT license.
 * https://github.com/mrjackdavis/grunt-msdeploy
 */

'use strict';

var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('msdeploy', '', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            msdeployPath: getExePath()
        });
        var targetName = this.target;
        grunt.log.writeln();
        grunt.log.writeln();
        grunt.log.writeln(this.target);
        grunt.log.writeln();

        var args = [];
        var fullCommand = '"' + options.msdeployPath + '"';
        var command = options.msdeployPath;

        //Build args
        //Loop through,
        //Assume all level 1 are arguments: "-arg:"
        //Assume all level 2 is parameters, can be a string, or multiple key value pairs

        delete options["msdeployPath"];

        for (var key in options){
            //append level 1 to args
            var argument = "-"+key+":";

            var obj = options[key];

            //Check if level 2 is string
            if(typeof obj === 'string' || obj instanceof String){
                //append string to args
                argument += obj;
            }else{
                //level 2 is key value pair, loop through and attach
                for (var prop in obj) {
                    if(obj.hasOwnProperty(prop)){
                        //Quote around path as it may contain spaces
                        var str = prop + "=\"" + obj[prop] +"\",";
                        argument += (str);
                    }
                }
                //Remove last comma
                argument = argument.slice(0, -1);
            }

            //Construct full command
            fullCommand += ' ' + argument;
        }

        grunt.log.writeln("Working...");

        var done = this.async();

        exec(fullCommand,{ maxBuffer: 2000*1024}, function (error, stdout, stderr) {
            grunt.log.write(stdout);
            if (error !== null) {
                grunt.log.error(stderr);
            } else {
                grunt.log.ok('msdeploy for "' + targetName + '" finished');
                done();
            }
        });
    });

    function getExePath() {

        var relativeMsDeployPath = "IIS/Microsoft Web Deploy V3/msdeploy.exe";

        var path64 = process.env.ProgramFiles;
        var path32 = process.env["ProgramFiles(x86)"];

        if (path64 != null) {
            var msDeploy64Path = path.resolve(path.join(path64, relativeMsDeployPath));
            if (fs.existsSync(msDeploy64Path)) {
                grunt.log.writeln("Found 64-bit version of msdeploy");
                return msDeploy64Path;
            }
        }

        if (path32 != null) {
            var msDeploy32Path = path.resolve(path.join(path32, relativeMsDeployPath));
            if (fs.existsSync(msDeploy32Path)) {
                grunt.log.writeln("Found 32-bit version of msdeploy");
                return msDeploy64Path;
            }
        }

        throw new Error("MSDeploy doesn't seem to be installed. Could not find msdeploy in \"" + msDeploy64Path + "\" or \"" + msDeploy32Path + "\". You can install it from http://www.iis.net/downloads/microsoft/web-deploy")
    }
};