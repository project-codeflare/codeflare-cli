#!/usr/bin/env bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

(npm ci && npm run build:headless) &
"$SCRIPTDIR"/setup.sh

 wait
