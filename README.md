# jsdoc-rst-template #

## WHAT IS THIS? ##
a simple template system for jsdoc 3+ that exports jsdoc to RST
(Restructured Text) (and an example of rst to html).  Currently this has
only been tested on Backbone + Marionette styled project using
require.js (modules).

Please view the examples to view how to structure your javascript comments.

Contributions are always welcome


## INSTALL ##

``` bash
git clone git@github.com:blitzagency/jsdoc-rst-template.git
cd jsdoc-rst-template
pip install sphinx sphinx_rtd_theme
npm install
make doc
make serve
```

or for your project:

```bash
npm install jsdoc
npm install jsdoc-rst-template
./node_modules/.bin/jsdoc -t ./node_modules/jsdoc-rst-template/template/ --recurse path/to/your/js -d ./doc/rst
```


