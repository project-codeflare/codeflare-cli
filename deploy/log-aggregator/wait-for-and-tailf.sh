#!/usr/bin/env bash

F="$1"

wait-for "$F" && tail -f -n +1 "$F"
