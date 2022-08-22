#!/usr/bin/env bash

F="$1"
D=$(dirname $F)

# wait for the file to exist and be non-empty
while [ ! -s "$F" ]; do
    if [ ! -d "$D" ]; then mkdir -p "$D" || break; fi
    inotifywait -qq -e create -e modify "$D"
done

if [ ! -s "$F" ]; then
    echo "Error in watch"
    exit 1
fi
