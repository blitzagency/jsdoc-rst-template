var fs = require('jsdoc/fs');
var path = require('jsdoc/path');
var helper = require('jsdoc/util/templateHelper');
var template = require('jsdoc/template');

var view;
var outdir = env.opts.destination;

exports.initializeView = function(){
    if(view) return view;

    var conf = env.conf.templates || {};
    conf['default'] = conf['default'] || {};

    var templatePath = env.opts.template;
    view = new template.Template(templatePath + '/tmpl');

    return view;
};


exports.generate = function(title, docs, filename, tmpl, resolveLinks) {
    // could probably make this so we don't have to check everytime.
    if(!view) initializeView();

    resolveLinks = resolveLinks === false ? false : true;

    var docData = {
        title: title,
        docs: docs
    };

    var outpath = path.join(outdir, filename),
        html = view.render(tmpl, docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');
};

