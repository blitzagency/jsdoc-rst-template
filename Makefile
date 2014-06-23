SHELL=/bin/bash

serve:
	cd docs/html && python -m SimpleHTTPServer

# COPY BELOW TO YOUR MAKEFILE

doc: clean rst-doc html-doc

clean:
	rm -rf ./docs/html

rst-doc:
	node_modules/.bin/jsdoc -t ./template --recurse example docs/rst/readme.rst -d docs/rst

html-doc:
	sphinx-build -b html -c ./ ./docs/rst ./docs/html

