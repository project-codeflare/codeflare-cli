#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

# this forces bin/codeflare to run in headless mode using a platform
# nodejs runtime (rather than using electron via ELECTRON_RUN_AS_NODE)
export NODE=node
export CODEFLARE_HEADLESS_HOME=$SCRIPTDIR/../../dist/headless

for i in "$SCRIPTDIR"/inputs/*; do
    OUT=$(mktemp)
    echo $OUT
    idx=$(basename $i)
    echo -n "Running $idx "
    $SCRIPTDIR/../../bin/codeflare -t test$idx $i/in.md | grep -v 'Guidebook successful' | grep -v ok > $OUT
    diff $i/out.txt $OUT && echo "✅" || (echo "❌" && cat $OUT && exit 1) 
done

