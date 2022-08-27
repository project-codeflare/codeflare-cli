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

# build docker image of log aggregator just for this test and load it
# into kind
function build {
    if [ -n "$TEST_LOG_AGGREGATOR" ]; then
        export LOG_AGGREGATOR_IMAGE=codeflare-log-aggregator:test
        FAST=true npm run build:docker:log-aggregator
        kind load docker-image $LOG_AGGREGATOR_IMAGE --name $CLUSTER
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
    local profileFull=$1
    local variant=$(dirname $profileFull)
    local profile=$(basename $profileFull)
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant
    mkdir -p "$MWPROFILES_PATH"

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

# Undeploy any prior ray cluster
function cleanup_ray {
    local profileFull=$1
    local variant=$(dirname $profileFull)
    local profile=$(basename $profileFull)
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant

    echo "[Test] Undeploying any prior ray cluster"
    (GUIDEBOOK_NAME="ray-undeploy" "$ROOT"/bin/codeflare -p $profile -y ml/ray/stop/kubernetes \
         || exit 0)
}

# Undeploy any prior log aggregator
function cleanup_log_aggregator {
    local profileFull=$1
    local variant=$(dirname $profileFull)
    local profile=$(basename $profileFull)
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant

    echo "[Test] Undeploying any prior ray cluster"
    (GUIDEBOOK_NAME="ray-undeploy" "$ROOT"/bin/codeflare -p $profile -y ml/ray/stop/kubernetes \
         || exit 0)
}

#
# Attach a log aggregator
# - $1: variant/profile e.g. non-gpu1/keep-it-simple
# - $2: JOB_ID
#
function attach {
    local profileFull=$1
    local variant=$(dirname $profileFull)
    local profile=$(basename $profileFull)
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant

    local jobId=$2

    echo "[Test] Attaching variant=$variant profile=$profile jobId=$jobId"
    GUIDEBOOK_NAME="log-aggregator-attach" "$ROOT"/bin/codeflare -V -p $profile attach -a $jobId --wait &
    ATTACH_PID=$!
    echo "[Test] Attach underway"
}

# @return path to locally captured logs for the given jobId, run in the given profile
function localpath {
    local profile=$1
    local jobId=$2

    local BASE=$(node -e "import('madwizard/dist/profiles/index.js').then(_ => _.guidebookJobDataPath({ profile: \"$profile\" })).then(console.log)")
    echo "$BASE/$jobId"
}

# Validate the output of the log aggregator
function validateAttach {
    local profileFull=$1
    local variant=$(dirname $profileFull)
    local profile=$(basename $profileFull)
    export MWPROFILES_PATH="$MWPROFILES_PATH_BASE"/$variant

    local jobId=$2

    RUNDIR=$(localpath $profile $jobId)

    if [ ! -d "$RUNDIR" ]; then
        echo "[Test] ❌ Logs were not captured locally: missing logdir"
        exit 1
    elif [ ! -f "$RUNDIR/jobid.txt" ]; then
        echo "[Test] ❌ Logs were not captured locally: missing jobid.txt"
        exit 1
    elif [ ! -f "$RUNDIR/logs/job.txt" ]; then
        echo "[Test] ❌ Logs were not captured locally: missing logs/job.txt"
        exit 1
    elif [ ! -s "$RUNDIR/logs/job.txt" ]; then
        echo "[Test] ❌ Logs were not captured locally: empty logs/job.txt"
        exit 1
    fi

    # TODO the expected output is going to be profile-specific
    grep -q 'Final result' "$RUNDIR/logs/job.txt" \
        && echo "[Test] ✅ Logs seem good!" \
            || (echo "[Test] ❌ Logs were not captured locally: job logs incomplete" && exit 1)
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
    if [ -n "$AGGREGATOR_POLLER_PID" ]; then
        (pkill -P $AGGREGATOR_POLLER_PID || exit 0)
    fi

    if [ -z "$NO_KIND" ]; then
        # don't kill ourselves if we're running in a container
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

        logpoller app=guidebook-log-aggregator &
        AGGREGATOR_POLLER_PID=$!

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
    if [ -n "$TEST_LOG_AGGREGATOR" ]; then
        export JOB_ID=$(node -e 'console.log(require("uuid").v4())')
        echo "[Test] Using JOB_ID=$JOB_ID"
    fi

    # 0. clean up prior ray clusters
    cleanup_ray "$1"
    
    # 1. launch codeflare guidebook run
    run "$1" | tee $OUTPUT &
    RUN_PID=$!

    # 2. if asked, attach a log aggregator
    if [ -n "$TEST_LOG_AGGREGATOR" ]; then
        cleanup_log_aggregator "$1"

        # wait to attach until the job has been submitted
        # while true; do
        #     grep -q 'submitted successfully' "$OUTPUT" && break
        #     sleep 1
        # done
        sleep 10

        attach "$1" "$JOB_ID"
    fi

    wait $RUN_PID
    echo "[Test] Run has finished"
    # the job should be done now

    # 3. if asked, now validate the log aggregator
    if [ -n "$TEST_LOG_AGGREGATOR" ]; then
        # TODO validate run status in captured logs; should be SUCCESSFUL
        validateAttach "$1" "$JOB_ID"
    fi
    
    # 4. validate the output of the job itself
    echo "[Test] Validating run output"
    grep succeeded $OUTPUT
}

trap onexit INT
trap onexit EXIT

start_kind
build
debug
test "$1"
