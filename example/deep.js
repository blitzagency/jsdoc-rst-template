/** @module foo.bar.baz */

define(function (require, exports, module) {

var marionette = require('marionette');
var template = require('hbs!../templates/template');


/**
 * @var
 * @memberOf foo.bar.baz
 */
var SOME_MODULE_VAR = 10;


/**
 * @function
 * @memberOf foo.bar.baz
 * @param {string} value The value you would like to pass
 */
function moduleFunction(value){

}


/**
 * Creates a new ItemView
 * @class ItemView
 * @extends marionette.ItemView
 * @memberOf foo.bar.baz
 * @example
 * var foo = 1;
 * // this is an internal comment
 * var bar = 2;
 */
var ItemView = marionette.ItemView.extend(
/** @lends foo.bar.baz.ItemView.prototype */
{

    template : template,

    ui : {

    },

    events : {

    },

    /**
     * @param {object} [options] Options for Initialization
     */
    initialize : function(options){
    },

    /**
     * @function
     */
    foo : function(){
    }
});

exports.ItemView = ItemView;
exports.moduleFunction = moduleFunction;

});
