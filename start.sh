#!/bin/bash

#ellenőrizni h. van-e node és npm?
#https://github.com/cliftonc/calipso/blob/master/bin/install.sh
#ellenőrizni hogy production gép vagy development

node=$(node --version)
npm=$(npm --version)

echo ""
echo -en '\E[0;32m'"\033[1mMesh Data Systems Kft. :\033[0m" 
tput sgr0
echo -e "\033[1m: Owners Site\033[0m"
echo ""
echo -en "\033[1mUsing Node version:\033[0m"
tput sgr0 
echo " $node"
echo -en "\033[1mUsing NPM  version:\033[0m"
tput sgr0
echo " v$npm"

if [ "$(pidof node)" ] 
then
  killall node
  echo ""
else
  echo ""
fi

node core.js