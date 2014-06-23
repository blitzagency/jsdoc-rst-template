// http://sphinx-doc.org/domains.html#the-javascript-domain

var helper = require('jsdoc/util/templateHelper');
var util = require('util');

function addAttribs(f) {
    var attribs = helper.getAttribs(f);
    var attribsString = buildAttribsString(attribs);

    f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}


function addParamAttributes(params) {
    return params.map(updateItemName);
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

    var params = f.params ? addParamAttributes(f.params) : [];
    f.signature = util.format( '%s(%s)', (f.signature || ''), params.join(', ') );
    //console.log(f);
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

    if (f.returns) {
        returnTypes = addNonParamAttributes(f.returns);
    }
    if (returnTypes.length) {
        returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join('|') );
    }

    f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
        '<span class="type-signature">' + returnTypesString + '</span>';
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


function updateItemName(item) {
    var attributes = getSignatureAttributes(item);
    var itemName = item.name || '';

    if (item.variable) {
        itemName = '&hellip;' + itemName;
    }

    if (attributes && attributes.length) {
        itemName = util.format( '%s<span class="signature-attributes">%s</span>', itemName,
            attributes.join(', ') );
    }

    return itemName;
}


exports.addAttribs = addAttribs;
exports.addParamAttributes = addParamAttributes;
exports.addNonParamAttributes = addNonParamAttributes;
exports.addSignatureParams = addSignatureParams;
exports.addSignatureReturns = addSignatureReturns;
exports.buildAttribsString = buildAttribsString;
exports.getSignatureAttributes = getSignatureAttributes;
exports.updateItemName = updateItemName;
