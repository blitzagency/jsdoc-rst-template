var helper = require('jsdoc/util/templateHelper');
var utils = require('./utils');

module.exports = function(context){
    var tmpl = 'module.tmpl';
    var filename = context.qualname.split('.').join('/') + helper.fileExtension;

    utils.generate('', context, filename, tmpl, false);
};
