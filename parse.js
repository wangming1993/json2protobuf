"use strict";

var raml = require('raml-parser');
var fs = require('fs');
var jsonfile = require('jsonfile');
var HashMap = require('hashmap');
var map = new HashMap();
var util = require('./util');
var path = require('path');

/*raml.loadFile('/home/user/workspace//developer/raml/api.raml').then(function(data) {
    //console.log(data.schemas.length)
    //writeFile("raml", data, '.json')
    data.schemas.forEach(function(schema) {
        writeFile("channel", schema, ".json")
        parseJson(schema)
    });
}, function(error) {
    console.log('Error parsing: ' + error);
});*/

function getFileName(filePath) {
    var fileName = path.basename(filePath);
    var index = fileName.indexOf('.');
    return fileName.substr(0, index);
}

function parseJson(jsonFile) {
    var body = jsonfile.readFileSync(jsonFile);
    var content = parseProperties(body.properties)
    if (isUndefined(body.id)) {
        body.id = getFileName(jsonFile);
    }
    var message = {
            id: body.id,
            content: content
        }
        //print(message);
    var template = generate(message, '')
        //print(template)
        //writeProto(message.id, template)
    return template;
}

function print(data) {
    if (typeof data === "string") {
        console.log(data)
    } else {
        console.log(JSON.stringify(data))
    }
}

function toJson(string) {
    if (typeof string === "string") {
        return JSON.parse(string);
    } else if (typeof string === "object") {
        return string;
    }
    return string;
}

function keys(data) {
    return Object.keys(data)
}

function isSingleType(type) {
    switch (type) {
        case "array":
        case "object":
            return false;
        default:
            return true;
    }
}

function parseProperties(properties) {
    properties = toJson(properties)

    var messages = []
    for (var key in properties) {
        var message = null;
        var content = toJson(properties[key]);

        if (!isUndefined(content['$ref'])) {
            message = {
                name: key,
                type: 'ref',
                value: content['$ref']
            }
        } else if (!isUndefined(content['enum'])) {
            message = {
                name: key,
                type: 'enum',
                value: content['enum']
            }
        } else {
            if (isSingleType(content.type)) {
                message = {
                    name: key,
                    type: content.type
                }
            } else {
                if (content.type === "array") {
                    message = {
                        name: key,
                        type: content.type,
                        value: content.items
                    }
                } else {
                    message = {
                        name: key,
                        type: content.type,
                        value: parseProperties(content.properties)
                    }
                }
            }
        }

        messages = messages.concat(message)
    }
    return messages
}

function generate(message, prefix) {
    var template = prefix + '';
    template += "message "
        //print(message.id)
    template += util.format('' + message.id)
    template += " {\n"
    var length = message.content.length
    for (var i = 1; i <= length; i++) {
        var line = addLine(message.content[i - 1], i, prefix)
        template += line
    }
    template += prefix + '}\n'
    return template
}

function getType(type) {
    switch (type) {
        case 'string':
            return 'string';
        case 'array':
            return 'repeact';
        case 'integer':
            return 'int64';
        case 'boolean':
            return 'bool';
        case 'number':
            return 'double';
        default:
            return 'string';
    }
}

function writeProto(name, content) {
    var directory = 'proto';
    mkdir(directory);
    writeFile(directory + '/' + name, content, '.proto')
}

function writeFile(name, content, type) {
    if (typeof content !== 'string') {
        content = JSON.stringify(content)
    }
    fs.writeFile(name + type, content, function(err) {
        if (err != null) throw err
    })
}

function mkdir(path) {
    if (fs.existsSync(path)) {
        return true;
    }
    return fs.mkdirSync(path);
}

function addLine(line, tag, prefix) {
    switch (line.type) {
        case 'string':
            return addSingleLine(line, tag, prefix);
            return string
        case 'object':
            return addObj(line, tag, prefix + '\t');
        case 'array':
            return addArray(line, tag, prefix + '\t');
        case 'ref':
            return addRef(line, tag, prefix + '\t');
        case 'enum':
            return addEnum(line, tag, prefix + '\t');
        default:
            return addSingleLine(line, tag, prefix);
    }
}

function addObj(line, tag, prefix) {
    var subTpl = prefix;
    subTpl += 'message '
    subTpl += util.format(line.name)
    subTpl += ' {\n'
    var length = line.value.length
    for (var i = 1; i <= length; i++) {
        var single = addLine(line.value[i - 1], i, prefix)
        subTpl += single
    }
    subTpl += prefix + '}\n'
    var template = subTpl + prefix + util.format(line.name)
    template += ' ' + line.name
    template += ' = ' + tag + ';\n'
    return template
}

function addArray(line, tag, prefix) {
    var subTmpl = '';
    var type = 'string';
    if (!isUndefined(line.value)) {
        var value = toJson(line.value)
        var content = '';
        if (isUndefined(value['$ref']) && isSingleType(value.type)) {
            type = value.type;
        } else {
            if (!isUndefined(value['$ref'])) {
                content = resolveRef(value['$ref']);
            } else {
                if (value.type === 'object') {
                    content = parseProperties(value.properties);
                }
            }
            type = util.format(line.name)
            var message = {
                id: type,
                content: content
            }
            subTmpl = generate(message, prefix)
        }
    }
    var template = subTmpl
    template += prefix;
    template += 'repeated ' + type + ' '
    template += line.name
    template += ' = ' + tag + ';\n'
    return template
}

function addEnum(line, tag, prefix) {
    var values = toJson(line.value);
    var template = prefix + 'enum ';
    template += util.format(line.name) + ' {\n';

    for (var i = 0; i < values.length; i++) {
        template += prefix + '\t'
        template += values[i].toUpperCase() + ' ';
        template += '= ' + i + ';\n';
    }
    template += prefix + '}\n';
    template += prefix + util.format(line.name) + ' ';
    template += line.name + ' = ' + tag + ';\n';
    return template;
}

function addSingleLine(line, tag, prefix) {
    var template = prefix + '\t'
    template += getType(line.type)
    template += ' ' + line.name
    template += ' = ' + tag
    template += ';\n'
    return template
}

function resolveRef(refId) {
    if (!map.has(refId)) return false;
    var file = map.get(refId);
    var json = jsonfile.readFileSync(file);
    return parseProperties(json.properties);
}

function addRef(line, tag, prefix) {
    var refId = line.value;
    if (!map.has(refId)) {
        print("Can't find ref");
        return
    }
    var content = resolveRef(refId)
    var message = {
        id: line.name,
        content: content
    }
    var template = generate(message, prefix)
    template += prefix + util.format(line.name)
    template += ' ' + line.name
    template += ' = ' + tag + ';\n'
    return template;
}

function descriptor(pkg) {
    var template = 'syntax = "proto3";\n\n'
    template += 'package ' + pkg + ';\n\n';
    return template;
}

function setIndex(files) {
    files.forEach(function(file) {
        var json = jsonfile.readFileSync(file);
        if (!isUndefined(json.id)) {
            map.set(json.id, file);
        }
    });
    //console.log(map);
}

function parse(files, isSplit) {
    var pkg = 'message';
    var header = descriptor(pkg)
    var template = '';
    for (var i = files.length - 1; i >= 0; i--) {
        if (isSplit) {
            var fileName = getFileName(files[i]);
            var tpl = header + parseJson(files[i])
            writeProto(fileName, tpl)
        } else {
            template += parseJson(files[i]);
        }
    }
    if (!isSplit) {
        template = header + template;
        writeProto(pkg, template)
    }
}

function isUndefined(value) {
    if (value === 'undefined' || value === undefined) {
        return true;
    }
    return false;
}

var functions = {
    parseJson: parseJson,
    toJson: toJson,
    print: print,
    setIndex: setIndex,
    parse: parse
}

module.exports = functions
