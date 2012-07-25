#!/bin/bash

KILL="/bin/kill"

srvpid=`/bin/cat "srv.pid" 2>/dev/null`
if [ -z "$srvpid" ]; then
    echo "Nincs process ID az srv.pid fájlban."
    exit 0;
fi
if ps -p $srvpid > /dev/null 2>&1; then :; else
    echo "pid file srv.pid létezik, de process nem fut. "\
        "talán nem megfelelően lett leállítva ?"
    exit 0;
fi  

printf "leállítás..."
$KILL $srvpid; status=$?

if [ $status -eq 1 ]; then
    echo "Nem lehetett megállítani a $srvpid"
    exit 0;
fi;

COUNTER=0
while ps -p $srvpid > /dev/null 2>&1 && [ $COUNTER -lt 60 ]; do
    printf "." 
    COUNTER=`expr $COUNTER + 1`
    sleep 2
done
if ps -p $srvpid > /dev/null 2>&1; then
    echo "Process $srvpid még mindíg fut, nem lehetett leállítani"
else
    echo "leállítva."
    rm -f "srv.pid"
fi  