"use strict";

var fs = require('fs');
var path = require('path');
var parser = require('./parse');

var toJson = parser.toJson;

var schemaDirectory = '/home/user/workspace/augmentum/developer/raml/schemas';

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

var files = osWalk(schemaDirectory);
parser.setIndex(files);

parser.parse(files);
