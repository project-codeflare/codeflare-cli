#!/usr/bin/env bash

#
# -a: force re-answering all questions
# -f <profile>: force re-answering for given profile
# -s: guidebook store root
# -b: run this guidebook
# -i: don't use kind; this is helpful when testing inside of a kubernetes cluster
#

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
. "$SCRIPTDIR"/values.sh

# don't use coscheduler, which is now the default; see the
# kubernetes/mcad/choose/scheduler guidebook
export KUBE_POD_SCHEDULER=default

# use a fixed cluster name
export RAY_KUBE_CLUSTER_NAME=codeflare-test-ray-cluster

# this forces bin/codeflare to run in headless mode using a platform
# nodejs runtime (rather than using electron via ELECTRON_RUN_AS_NODE)
export NODE=node
export CODEFLARE_HEADLESS_HOME=${CODEFLARE_HEADLESS_HOME-$ROOT/dist/headless}

while getopts "ab:f:is:" opt
do
    case $opt in
        a) FORCE_ALL=true; continue;;
        f) FORCE=$OPTARG; continue;;
        s) export GUIDEBOOK_STORE=$OPTARG; echo "[Test] Using store=$GUIDEBOOK_STORE"; continue;;
        b) GUIDEBOOK=$OPTARG; continue;;
        i) NO_KIND=true; continue;;
        *) continue;;
    esac
done
shift $((OPTIND-1))

# We get this for free from github actions. Add it generally. This
# informs the guidebooks to adjust their resource demands.
export CI=true

# If you find that dangling processes (mostly kubectl) linger, this
# may help with debugging; you may also set it to "*" to get
# everything. Word of warning: kubectl seems to respond to DEBUG being
# set to *anything*, so expect to get a bunch of low-level go logs, no
# matter what you set this to.
# export DEBUG=madwizard/cleanup

function start_kind {
    if [ -z "$NO_KIND" ]; then
        export KUBECONFIG=$("$SCRIPTDIR"/setup.sh)
        echo "[Test] Using KUBECONFIG=$KUBECONFIG"
    fi
}

#
# !!!! This is the main work of the test !!!!
#
# - launch bin/codeflare -p $profile against the $guidebook
# - it is up to the caller to validate the output of this command,
#   e.g. by looking for "succeeded" (see below)
#
function run {
    local profileFull="$1"
    local variant=$(dirname "$profileFull")
    local profile=$(basename "$profileFull")
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant
    mkdir -p "$MWPROFILES_PATH"

    if [ "$profile" = "ray-autoscaler" ]; then
        # ugh, the old ray operator uses a different naming convention
        export RAY_KUBE_CLUSTER_HEAD_SERVICE=$RAY_KUBE_CLUSTER_NAME-ray-head
        echo "[Test] Run: using Ray operator's convention for naming ray-head service $RAY_KUBE_CLUSTER_HEAD_SERVICE"
    fi

    local guidebook=${2-$GUIDEBOOK}
    local yes=$([ -z "$FORCE_ALL" ] && [ "$FORCE" != "$profileFull" ] && [ -f "$MWPROFILES_PATH/$profile" ] && echo "--yes" || echo "")

    local PRE="$MWPROFILES_PATH_BASE"/../profiles.d/$profile/pre
    if [ -f "$PRE" ]; then
        echo "[Test] Running pre guidebooks for profile=$profile"
        cat "$PRE" | xargs -n1 "$ROOT"/bin/codeflare -p $profile $yes
    fi

    echo "[Test] Running with variant=$variant profile=$profile yes=$yes"
    GUIDEBOOK_NAME="main-job-run" "$ROOT"/bin/codeflare -p $profile $yes $guidebook
}

#
# Attach a log streamer
# - $1: variant/profile e.g. non-gpu1/keep-it-simple
# - $2: JOB_ID
#
function attach {
    local profileFull="$1"
    local variant=$(dirname "$profileFull")
    local profile=$(basename "$profileFull")
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant

    local jobId=$2

    if [ "$profile" = "ray-autoscaler" ]; then
        # ugh, the old ray operator uses a different naming convention
        export RAY_KUBE_CLUSTER_HEAD_SERVICE=$RAY_KUBE_CLUSTER_NAME-ray-head
        echo "[Test] Attach: using Ray operator's convention for naming ray-head service $RAY_KUBE_CLUSTER_HEAD_SERVICE"
    fi

    LOGFILE=$(mktemp)

    echo "[Test] Attaching variant=$variant profile=$profile jobId=$jobId"
    GUIDEBOOK_NAME="log-streamer" "$ROOT"/bin/codeflare -V -p $profile logs $jobId > $LOGFILE &
    ATTACH_PID=$!
    echo "[Test] Attach underway, streaming to $LOGFILE"
}

# Validate the output of the log streamer
function validateAttach {
    local LOGFILE=$1

    if [ ! -f "$LOGFILE" ]; then
        echo "[Test] ❌ Logs were not captured locally: missing log file"
        exit 1
    fi

    # TODO the expected output is going to be profile-specific
    grep -q 'Final result' "$LOGFILE" \
        && echo "[Test] ✅ Logs seem good!" \
            || (echo "[Test] ❌ Logs were not captured locally to $LOGFILE: job logs incomplete" && ls -l "$LOGFILE" && cat "$LOGFILE" && exit 1)
}

function logpoller {
    sleep 10
    while true; do
        kubectl logs -l $1 -f
        sleep 3
    done
}

#
# clean up after ourselves before we exit
#
function onexit {
    echo "[Test] onexit handler"

    if [ -n "$ATTACH_PID" ]; then
        (pkill -P $ATTACH_PID || exit 0)
    fi
    if [ -n "$HEAD_POLLER_PID" ]; then
        (pkill -P $HEAD_POLLER_PID || exit 0)
    fi
    if [ -n "$WORKER_POLLER_PID" ]; then
        (pkill -P $WORKER_POLLER_PID || exit 0)
    fi
    if [ -n "$EVENTS_PID" ]; then
        (pkill -P $EVENTS_PID || exit 0)
    fi

    if [ -z "$NO_KIND" ]; then
        # don't kill ourselves if we're running in a container
        sleep 10
        echo "[Test] pkilling ourselves to help with cleanup"
        pkill -P $$
    fi
}

#
# stream out logs, if we were asked to do so (via `DEBUG_KUBERNETES=1`)
#
function debug {
    if [ -n "$DEBUG_KUBERNETES" ]; then
        logpoller ray-node-type=head &
        HEAD_POLLER_PID=$!

        logpoller ray-node-type=worker &
        WORKER_POLLER_PID=$!

        kubectl get events -w &
        EVENTS_PID=$!
    fi
}

#
# This is the heart of the test.
#
#   - 1. `run` fires off a run; capture the output to $OUTPUT file
#   - 2. fire of log aggregator
#   - 3. validate log aggregator output
#   - 4. validate job output
#
function test {
    OUTPUT=$(mktemp)

    # allocate JOB_ID (requires node and `uuid` npm; but we should
    # have both for codeflare-cli dev)
    export JOB_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    echo "[Test] Using JOB_ID=$JOB_ID"

    # 1. launch codeflare guidebook run
    run "$1" | tee $OUTPUT &
    local RUN_PID=$!
    echo "[Test] Run submitted pid=$RUN_PID"

    # wait to attach until the job has been submitted
    while true; do
        grep -q 'Run it' "$OUTPUT" && break
        echo "[Test] Waiting to attach log streamer..."
        sleep 1
    done

    # echo "[Test] Preparing to attach log streamer jobid=$JOB_ID"
    # attach "$1" "$JOB_ID"

    wait $RUN_PID
    echo "[Test] Run has finished"
    # the job should be done now

    # 3. if asked, now validate the log streamer
    # TODO validate run status in captured logs; should be SUCCESSFUL
    # validateAttach $LOGFILE
    
    # 4. validate the output of the job itself
    echo "[Test] Validating run output"
    if grep -q SUCCEEDED $OUTPUT ; then
        echo "[Test] ✅ Job submit output seems good!"
    else
        echo "[Test] ❌ Job submit output seems incomplete: $OUTPUT"
        exit 1
    fi
}

trap onexit INT
trap onexit EXIT

start_kind
debug
test "$1"
