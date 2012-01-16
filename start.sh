#!/bin/bash

#ellenőrizni h. van-e node és npm?
#https://github.com/cliftonc/calipso/blob/master/bin/install.sh
#ellenőrizni hogy production gép vagy development

node=$(node --version)
npm=$(npm --version)

echo ""
echo "********************************************************"
echo "*        Mesh Data Systems Kft.  -  Owners Site        *"
echo "*             Using Node version:  $node             *"
echo "*      Using NPM version: $npm      *"
echo "********************************************************"
echo ""
echo "Server started..."

killall node
node core.js