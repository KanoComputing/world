#!/bin/bash

rm -rf www

cp -r src www
vulcanize www/elements/elements.html --inline-scripts | crisper -h www/elements/elements.html -j www/elements/elements.js

uglifyjs www/elements/elements.js -o www/elements/elements.js
