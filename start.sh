#!/bin/bash

#ellenőrizni h. van-e node és npm?
#https://github.com/cliftonc/calipso/blob/master/bin/install.sh
#ellenőrizni hogy production gép vagy development

NOHUP="/usr/bin/nohup"

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

#Fut-e már?
SRV_PID=`cat "srv.pid" 2> /dev/null`
if [ -n "$SRV_PID" ]; then
    if ps -p $SRV_PID > /dev/null; then
        echo "process $SRV_PID már fut. kérlek állítsd le (stop.sh) és próbáld újra."
        exit 4
    else
        echo "pid file srv.pid létezik, de process nem fut. "\
            "talán nem megfelelően lett leállítva ?"
        rm -f "srv.pid"
        SRV_PID=
    fi
fi

#indítás a háttérben
$NOHUP node core.js </dev/null >> "console.log" 2>&1 &
echo $! > "srv.pid"