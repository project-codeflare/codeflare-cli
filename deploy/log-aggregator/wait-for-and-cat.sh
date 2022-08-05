#!/usr/bin/env bash

F="$1"

wait-for "$F" && cat "$F"
