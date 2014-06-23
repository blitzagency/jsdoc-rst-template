// http://sphinx-doc.org/domains.html#the-javascript-domain

var _ = require('underscore');
var fs = require('jsdoc/fs');
var helper = require('jsdoc/util/templateHelper');
var util = require('util');
var htmlsafe = helper.htmlsafe;


function addAttribs(f) {
    var attribs = helper.getAttribs(f);
    var attribsString = buildAttribsString(attribs);

    f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}

function addNonParamAttributes(items) {
    var types = [];

    items.forEach(function(item) {
        types = types.concat( buildItemTypeStrings(item) );
    });

    return types;
}


function addSignatureParams(f) {
    /**
     * http://usejsdoc.org/tags-param.html
     *
     * required:
     * @param {string} somebody Somebody's name.
     *
     * optional
     * @param {string} [somebody] Somebody's name.
     *
     * default:
     * @param {string} [somebody=John Doe] Somebody's name.
     *
     * optional multi-type
     * @param {(string|string[])} [somebody] Somebody's name.
     *
     * required any type
     * @param {*} somebody Somebody's name.
     *
     * variadic
     * @param {...string} somebody Somebody's name.
     */

    var params = f.params ? f.params : [];
    var args = [];
    var optional = null;

    params.forEach(function(param){

        if(param.optional){
            optional = optional || [];
            optional.push(param);

        } else {

            if(optional){
                args.push(optional);
                optional = null;
            }

            args.push(param);
        }
    });

    if (optional) args.push(optional);

    argSig = '';
    var count = 0;

    args.forEach(function(arg){
        // only optional args will be arrays.
        // console.log(arg);
        if(_.isArray(arg)){
            var value = createOptionalSignature(arg);
            if(count > 0){
                argSig =  argSig + '[, ' + value.substr(1);

            } else {
                argSig =  argSig + value;
            }
        } else {
            if(count > 0){
                argSig = argSig + ', ' + arg.name;
            } else {
                argSig = argSig + arg.name;
            }

            if(arg.defaultvalue){
                argSig = argSig + '=' + arg.defaultvalue;
            }
        }

        count++;
    });


    f.signature = util.format('%s(%s)', (f.signature || ''), argSig);
}

function createOptionalSignature(args){
    var value = '[';
    var count = 0;

    args.forEach(function(arg){
        if(count > 0){
            value = value + '[, ';
        }

        if(arg.defaultvalue){
            value += arg.name + '=' + arg.defaultvalue;
        } else {
            value += arg.name;
        }

        count++;
    });

    for (var i = 0; i < count; i++) {
        value = value + ']';
    }

    return value;
}


function addSignatureReturns(f) {
    var attribs = [];
    var attribsString = '';
    var returnTypes = [];
    var returnTypesString = '';

    // jam all the return-type attributes into an array. this could create odd results (for example,
    // if there are both nullable and non-nullable return types), but let's assume that most people
    // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
    if (f.returns) {
        f.returns.forEach(function(item) {
            helper.getAttribs(item).forEach(function(attrib) {
                if (attribs.indexOf(attrib) === -1) {
                    attribs.push(attrib);
                }
            });
        });

        attribsString = buildAttribsString(attribs);
    }

    // if (f.returns) {
    //     console.log(f.returns[0].type.names);
    //     returnTypes = addNonParamAttributes(f.returns);
    // }
    // if (returnTypes.length) {
    //     returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join('|') );
    // }

    // f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
    //     '<span class="type-signature">' + returnTypesString + '</span>';
}


function buildAttribsString(attribs) {
    var attribsString = '';

    if (attribs && attribs.length) {
        attribsString = htmlsafe( util.format('(%s) ', attribs.join(', ')) );
    }

    return attribsString;
}

function getSignatureAttributes(item) {
    var attributes = [];

    if (item.optional) {
        attributes.push('opt');
    }

    if (item.nullable === true) {
        attributes.push('nullable');
    }
    else if (item.nullable === false) {
        attributes.push('non-null');
    }

    return attributes;
}


exports.addAttribs = addAttribs;
exports.addNonParamAttributes = addNonParamAttributes;
exports.addSignatureParams = addSignatureParams;
exports.addSignatureReturns = addSignatureReturns;
exports.buildAttribsString = buildAttribsString;
exports.getSignatureAttributes = getSignatureAttributes;
