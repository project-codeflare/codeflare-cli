#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
. "$SCRIPTDIR"/values.sh

export KUBECONFIG=$("$SCRIPTDIR"/setup.sh)
echo "Using KUBECONFIG=$KUBECONFIG"

# We get this for free from github actions. Add it generally. This
# informs the guidebooks to adjust their resource demands.
export CI=true

echo "================NODE INFO================="
kubectl get node -o custom-columns=CAPACITY:.status.capacity
echo "=========================================="

while getopts "ab:f:s:" opt
do
    case $opt in
        a) FORCE_ALL=true; continue;;
        f) FORCE=$OPTARG; continue;;
        s) export GUIDEBOOK_STORE=$OPTARG; continue;;
        b) GUIDEBOOK=$OPTARG; continue;;
        *) continue;;
    esac
done
shift $((OPTIND-1))

mkdir -p "$MWPROFILES_PATH"

function run {
    local profile=$1
    local guidebook=${2-$GUIDEBOOK}
    local yes=$([ -z "$FORCE_ALL" ] && [ "$FORCE" != "$profile" ] && [ -f "$MWPROFILES_PATH/$profile" ] && echo "--yes" || echo "")

    local PRE="$MWPROFILES_PATH"/../profiles.d/$profile/pre
    if [ -f "$PRE" ]; then
        echo "Running pre guidebooks for profile $profile"
        cat "$PRE" | xargs -n1 "$ROOT"/bin/codeflare -p $profile $yes
    fi
        
    echo "Running with profile $profile"
    "$ROOT"/bin/codeflare -p $profile $yes $guidebook
}

function logpoller {
    local type=$1

    sleep 10
    while true; do
        kubectl logs -l ray-node-type=$type -f
        sleep 3
    done
}

if [ -n "$DEBUG_KUBERNETES" ]; then
    logpoller head &
    HEAD_POLLER_PID=$!

    logpoller worker &
    WORKER_POLLER_PID=$!
fi

if [ -n "$1" ]; then
    OUTPUT=$(mktemp)
    run "$1" | tee $OUTPUT
    grep succeeded $OUTPUT
else
    idx=1
    for i in "$SCRIPTDIR"/profiles/*; do
        profile=$(basename $i)

        if [ $idx -gt 1 ]; then
            echo "Tearing down previous setup"
            run $profile ml/ray/stop/kubernetes
        fi

        OUTPUT=$(mktemp)
        run $profile | tee $OUTPUT
        grep succeeded $OUTPUT
        idx=$((idx + 1))
    done
fi

if [ -n "$HEAD_POLLER_PID" ]; then
    (kill $HEAD_POLLER_PID || exit 0)
fi
if [ -n "$WORKER_POLLER_PID" ]; then
    (kill $WORKER_POLLER_PID || exit 0)
fi
