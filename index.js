"use strict";

var fs = require('fs');
var path = require('path');
var optimist = require('optimist');
var parser = require('./parse');
var options = require('./options');
var pkgjson = require('./package.json');
var toJson = parser.toJson;

var schemaDirectory = '/home/user/workspace//developer/raml/schemas';

function osWalk(dir) {
    var dirFiles = [];
    var files = fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
        var realpath = path.join(dir, files[i]);
        var stats = fs.statSync(realpath);
        if (stats.isFile()) {
            dirFiles = dirFiles.concat(realpath);
        } else {
            dirFiles = dirFiles.concat(osWalk(realpath));
        }
    }
    return dirFiles;
}


function run(jsonDirectory, split) {
    var files = osWalk(jsonDirectory);
    parser.setIndex(files);

    parser.parse(files, split);
}


var argv = optimist
    .usage("Usage: \n  node index.js -d directory" +
    "\n\nExample: \n  " + "node index.js -d  /home/user/schemas")
    .options(options)
    .wrap(80)
    .argv;

var argError = false;

if (argv.help === true) {
  optimist.showHelp(console.error);
  process.exit(0);
}

if (argv.version === true) {
    console.log('version: ' + pkgjson.version);
    process.exit(0);
}

if (argv.dir === undefined) {
    console.error("Required json directory, pls use --dir specfics a input json schemas directory")
    process.exit(1);
}

var split = false;
if (argv.split !== undefined) {
    split = argv.split;
}

var jsonDirectory = argv.dir;
run(jsonDirectory, split);
