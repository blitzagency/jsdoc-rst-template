var _ = require('underscore');
var fs = require('jsdoc/fs');
var utils = require('./utils');
var helper = require('jsdoc/util/templateHelper');
var generateModule = require('./module');

module.exports = function(modules, find, docs, filename, resolveLinks){
    var tmpl = 'index.tmpl';
    var apiTmpl = 'api.tmpl';

    var toc = [];
    var moduleData = {};


    function maybeGetContextForName(memberof){
        var response = {};
        response.members = find({kind: 'member', memberof: memberof});
        response.functions = find({kind: 'function', memberof: memberof});
        response.classes = find({kind: 'class', memberof: memberof});

        if(response.members.length === 0 &&
           response.functions.length === 0 &&
           response.classes.length === 0 ){
            return false;
        }

        return response;
    }

    function createKey(obj, key_arr){
        if(key_arr.length){
            var key = key_arr.shift();
            obj[key] = obj[key] ? obj[key] : {};
            if(key_arr.length){
                createKey(obj[key], key_arr);
            }
        }
    }

    function createTOCIndexFile(location, contents){
        // console.log(location)
        // console.log(contents)
        // var contents = [];
        var fileLocation = location + '__index__' + helper.fileExtension;
        var fileContents = [];
        _.each(contents, function(child, key){
            // is directory?
            if(Object.keys(child).length){
                fileContents.push(location + key + '/__index__');
                // @TODO might need to check if this is also a file?
                // could use maybeGetContextForName ?
                // if so.... uncomment this:
                // fileContents.push(location + key);
            }else{
                fileContents.push(location + key);

            }
        });
        var name = location.split('/');
        name.pop();
        // console.log(location)
        // console.log(fileContents)
        fileContents = _.map(fileContents, function(item){
            return item.replace(location, '');
        });
        var toc = fileContents.join('\n    ');
        utils.generate(name.pop(), toc, fileLocation, 'moduleIndex.tmpl', resolveLinks);
    }

    function recurseDirectoryObject(obj, prefix){
        prefix = prefix || '';
        _.each(obj, function(item, key){
            if(Object.keys(item).length){
                // its not a leaf(file), keep going
                var loc = prefix+key+'/';
                createTOCIndexFile(loc, item);
                recurseDirectoryObject(item, loc);
            }

            var name = (prefix + key).split('/').join('.');
            var ctx = maybeGetContextForName(name);
            if(!ctx) return;

            var module = moduleData[name];

            ctx.qualname = name;
            ctx.name = key;
            ctx.description = module.description;
            generateModule(ctx);
        });
    }

    function parseTOC(toc){
        var obj = {};
        _.each(toc, function(item){
            var tempArr = item.split('/');
            createKey(obj, tempArr);
        });
        recurseDirectoryObject(obj);
        return obj;
    }

    function buildRootTOC(toc){
        var output = [];
        _.map(toc, function(tocObj, key){
            var fileWithSameName =  maybeGetContextForName(key);
            if(fileWithSameName){
                output.push(key);
            }
            output.push(key+'/__index__');
        });
        return output;
    }

    Object.keys(helper.longnameToUrl).forEach(function(longname) {

        var myModules = helper.find(modules, {longname: longname});
        var outdir = env.opts.destination;

        if (myModules.length) {
            var module = myModules[0];
            var context;

            if(module.memberof){
                var memberof = module.memberof + '.' + module.name;
                var path = module.memberof.split('.').join('/');

                moduleData[memberof] = module;
                toc.push(path + '/' + module.name);
                fs.mkPath(outdir + '/' + path);

            } else {
                moduleData[module.name] = module;
                toc.push(module.name);
            }
        }

    });


    // builds all of the sub files and index's, also returns the structure
    var tocObj = parseTOC(toc);
    var toc = buildRootTOC(tocObj);
    toc.sort();
    docs.toc = toc.join('\n    ');
    utils.generate('Index', docs, filename, tmpl, resolveLinks);
    utils.generate('api', docs, 'api'+helper.fileExtension, apiTmpl, resolveLinks);
};

