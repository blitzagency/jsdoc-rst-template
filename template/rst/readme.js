var fs = require('jsdoc/fs');

function readme(){

    // source files named `readme.rst` get special treatment
    for (var i = 0, l = env.opts._.length; i < l; i++) {
        opt = env.opts._[i];

        if ( /(\bREADME|\.rst)$/i.test(opt) ) {
            var content = fs.readFileSync(opt, env.opts.encoding);
            env.opts.readme = content;
            env.opts._.splice(i--, 1);
        }
    }
}

module.exports = readme;
