#!/bin/bash

#TODO: check if node and npm is available
#TODO: check <runmode>.conf and apply
#https://github.com/cliftonc/calipso/blob/master/bin/install.sh

NOHUP="/usr/bin/nohup"

#example :echo "${RED}$1${RESET}"
RED=`tput setaf 1`
GREEN=`tput setaf 2`
WHITE=`tput setaf 7`
RESET=`tput sgr0`


NODE=$(node --version)
NPM=$(npm --version)

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

#Is it running?
SRV_PID=`cat "srv.pid" 2> /dev/null`
if [ -n "$SRV_PID" ]; then
    if ps -p $SRV_PID > /dev/null; then
        echo "process $SRV_PID is already running. Please stop it (stop.sh) and retry."
        exit 4
    else
        echo "pid file srv.pid is available, but no running process. "
        rm -f "srv.pid"
        SRV_PID=
    fi
fi

#indítás a háttérben
$NOHUP node core_new.js </dev/null >> "console.log" 2>&1 &
echo $! > "srv.pid"
