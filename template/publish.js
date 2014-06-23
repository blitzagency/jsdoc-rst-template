var fs = require('jsdoc/fs');
//var template = require('jsdoc/template');
var helper = require('jsdoc/util/templateHelper');
var taffy = require('taffydb').taffy;
var path = require('jsdoc/path');
//var util = require('util');
//var htmlsafe = helper.htmlsafe;
var rst = require('./rst/utils');
var readme = require('./rst/readme');
var generateIndex = require('./rst/templates/index');
var initializeView = require('./rst/templates/utils').initializeView;

var data;
var outdir = env.opts.destination;

helper.fileExtension = '.rst';


function find(spec) {
    return helper.find(data, spec);
}


function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return null;
    }

    return doclet.meta.path && doclet.meta.path !== 'null' ?
        path.join(doclet.meta.path, doclet.meta.filename) :
        doclet.meta.filename;
}

function shortenPaths(files, commonPrefix) {
    Object.keys(files).forEach(function(file) {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            // always use forward slashes
            .replace(/\\/g, '/');
    });

    return files;
}

function needsSignature(doclet) {
    var needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (var i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}


exports.publish = function(taffyData, opts, tutorials) {

    // console.log(taffyData);
    // console.log(opts);
    // console.log(tutorials);

    // we look for a file called readme.rst in the files that
    // have been passed in. If Found, we will pull it out of the
    // file list, and reads it's contents into opts.readme.
    readme();
    data = taffyData;

    var view = initializeView();

    // view helpers
    view.find = find;
    view.tab = '    ';

    view.formatTextWithTabs = function(value, tabCount){
        tabCount = tabCount || 0;
        value = value || '';

        var tabs = this.repeat(this.tab, tabCount);
        var out = tabs + value.split('\n').join('\n' + tabs);
        return out;
    };

    view.repeat = function(data, count){

        if(count === 0){
            return data;
        }

        var out = [];

        for (var i=0; i < count; i++) {
            out.push(data);
        }

        return out.join('');
    };


    // var conf = env.conf.templates || {};
    // conf['default'] = conf['default'] || {};

    // var templatePath = opts.template;
    // view = new template.Template(templatePath + '/tmpl');


    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    var indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    var globalUrl = helper.getUniqueFilename('global');
    helper.registerLink('global', globalUrl);


    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    var sourceFiles = {};
    var sourceFilePaths = [];

     data().each(function(doclet) {
         //console.log(doclet)
         doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(function(example) {
                var code;

                // tabbed in for .. code-block:: javascript
                // rendering
                code = example;

                // remap examples to examples.code
                // allows for future exapnsion if @example
                // neds to do work beyond just code.
                return {
                    code: code
                };
            });
        }
        // if (doclet.see) {
        //     doclet.see.forEach(function(seeItem, i) {
        //         doclet.see[i] = hashToLink(doclet, seeItem);
        //     });
        // }

        // build a list of source files
        var sourcePath;
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            sourceFiles[sourcePath] = {
                resolved: sourcePath,
                shortened: null
            };
            if (sourceFilePaths.indexOf(sourcePath) === -1) {
                sourceFilePaths.push(sourcePath);
            }
        }
    });


    // update outdir if necessary, then create outdir
    var packageInfo = ( find({kind: 'package'}) || [] ) [0];
    if (packageInfo && packageInfo.name) {
        outdir = path.join(outdir, packageInfo.name, packageInfo.version);
    }

    fs.mkPath(outdir);

    if (sourceFilePaths.length) {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }

    // Generate links/URLs between RST Docs
    data().each(function(doclet) {
        var url = helper.createLink(doclet);

        // TODO: Figure out RST intra-doc links
        // the url that comes back is good for
        // html linking within a document
        // http://sphinx-doc.org/markup/inline.html#ref-role
        //
        // Basically, we need to own helper.createLink
        helper.registerLink(doclet.longname, url);
        //console.log(doclet.longname, '->', url);

        // add a shortened version of the full path
        var docletPath;
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.shortpath = docletPath;
            }
        }
    });


    // Generate Signatures and Attributes
    // TODO: These need to be RST-ified
    data().each(function(doclet) {
        var url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }

        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            rst.addSignatureParams(doclet);
            rst.addSignatureReturns(doclet);
            rst.addAttribs(doclet);
        }

    });

    /*
     * TODO: Figure out what this does

    // do this after the urls have all been generated
    data().each(function(doclet) {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    *
    */

    // somewhere around here we need to build the index.rst
    // so it's like this:
    // https://raw.githubusercontent.com/blitzagency/edgeproc/master/edgeproc/docs/source/index.rst?token=75315__eyJzY29wZSI6IlJhd0Jsb2I6YmxpdHphZ2VuY3kvZWRnZXByb2MvbWFzdGVyL2VkZ2Vwcm9jL2RvY3Mvc291cmNlL2luZGV4LnJzdCIsImV4cGlyZXMiOjE0MDM4NzQ4MzR9--77da1848e16ce5b6ffb1e1417ddac5a0b02af428

    var members = helper.getMembers(data);

    // the default has some drama here that we are currently omitting.
    // - adding view helpers
    // - source file output
    // - generating the global page
    // https://github.com/jsdoc3/jsdoc/blob/master/templates/default/publish.js#L565-L588

    /**
     * Generate the index

     // index page displays information from package.json and lists files
    var files = find({kind: 'file'}),
        packages = find({kind: 'package'});

    generate('Index',
        packages.concat(
            [{kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'}]
        ).concat(files),
    indexUrl);

    *
    */

    //console.log(helper.longnameToUrl);
    // set up the lists that we'll use to generate pages
    var classes = taffy(members.classes);
    var modules = taffy(members.modules);
    var namespaces = taffy(members.namespaces);
    var mixins = taffy(members.mixins);
    var externals = taffy(members.externals);

    generateIndex(
        modules, find,
        {
            readme: opts.readme,
            longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'
        },
        indexUrl);

    Object.keys(helper.longnameToUrl).forEach(function(longname) {
        // var myClasses = helper.find(classes, {longname: longname});
        // if (myClasses.length) {
        //     console.log('Needs write file:', helper.longnameToUrl[longname]);
        //     //console.log(myClasses);
        //     //generate('Class: ' + myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        // }

        // var myModules = helper.find(modules, {longname: longname});
        // if (myModules.length) {
        //     console.log(myModules);
        //     //generate('Module: ' + myModules[0].name, myModules, helper.longnameToUrl[longname]);
        // }

        // var myNamespaces = helper.find(namespaces, {longname: longname});
        // if (myNamespaces.length) {
        //     generate('Namespace: ' + myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        // }

        // var myMixins = helper.find(mixins, {longname: longname});
        // if (myMixins.length) {
        //     generate('Mixin: ' + myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        // }

        // var myExternals = helper.find(externals, {longname: longname});
        // if (myExternals.length) {
        //     generate('External: ' + myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        // }
    });
};
