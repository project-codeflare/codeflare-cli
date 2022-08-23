#!/usr/bin/env bash

F="$1"
D=$(dirname $F)

# wait for the file to exist and be non-empty
while [ ! -s "$F" ]; do
    if [ ! -d "$D" ]; then mkdir -p "$D" || break; fi
    echo "Waiting for $F" 1>&2
    inotifywait -qq -e create -e modify "$D"
    if [ ! -s "$F" ]; then sleep 2; fi
done

if [ ! -s "$F" ]; then
    echo "Error in watch"
    exit 1
fi
