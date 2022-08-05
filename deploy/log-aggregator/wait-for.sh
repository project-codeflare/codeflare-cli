#!/usr/bin/env bash

F="$1"

# wait for the file to exist and be non-empty
while [ ! -s "$F" ]; do
    mkdir -p $(dirname $F)
    inotifywait -qq -e create -e modify "$(dirname $F)"
done
