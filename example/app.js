/**
 * Module Description Here
 * @module zap
 */


define(function (require, exports, module) {

var marionette = require('marionette');
var template = require('hbs!../templates/template');


/**
 * It's an important module var
 *
 * .. warning::
 *
 *    Don't mess with Texas
 *
 * warning
 *
 * @var
 * @type {Number}
 * @default
 * @memberOf zap
 */
var SOME_MODULE_VAR = true;

/**
 * It's an important module var
 * @var
 * @type {Number}
 * @default
 * @memberOf zap
 */

var EXPLODER = 10;


/**
 * It's a module level function
 * @function
 * @memberOf zap
 * @param {string} source The value you would like to pass
 * @param {string} [filename] The value you would like to pass
 * @param {string} [symbol] The value you would like to pass
 * @returns {string|bool} The return value description
 *
 * @example
 * var foo = require('foo');
 * var result = foo.moduleFunction('foo/bar.txt', 'bar.zip', '*')
 * example
 *
 */
function moduleFunction(source, filename, symbol){

}


var ItemView = marionette.ItemView.extend(
/** @lends zap.ItemView.prototype */
{

    template : template,

    ui : {

    },

    events : {

    },

    /**
     * Creates a new ItemView for fun and profit
     *
     * .. note ::
     *     This should be the example you follow
     *
     * @constructs
     * @extends marionette.ItemView
     * @param {object} [options] Options for Initialization
     *
     *warning
     *
     * @example
     * var foo = 1;
     * // this is an internal comment
     * var bar = 2;
     *
     * @example
     * var nano = 1
     */
    initialize : function(options){
    },


    /**
     * The venerable foo function
     * @function
     * @param {bool} shouldFoo Want to foo? This is your method.
     * @param {bool} [always=true] Always be sure to foo
     * @returns {string} Probably 'bar' or 'world'
     *
     * @example
     * var view = new ItemView();
     * view.foo(false, true);
     */
    foo : function(shouldFoo, always){
    }
});

exports.ItemView = ItemView;
exports.moduleFunction = moduleFunction;

});
