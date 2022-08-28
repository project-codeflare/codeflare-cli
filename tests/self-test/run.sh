#!/usr/bin/env bash

#
# This is used for *testing* the self-test capability.
#
# Generally speaking, self-test launches codeflare tests such that the
# test launcher itself runs inside of a pod (a Job, actually; see
# self-test.yaml).
#
# This script does so against a local kind cluster. It is helpful to
# test the script and self-test capability, but is not intended for
# actual self-testing in the field.
#

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

KIND="$SCRIPTDIR"/../../tests/kind
export SELF_TEST_IMAGE=codeflare-self-test:test
export VARIANTS=${VARIANTS-non-gpu1}
YAML=$(mktemp)

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
. "${KIND}"/values.sh

# start kind, if needed
function start_kind {
    export KUBECONFIG=$("$KIND"/setup.sh)
    echo "[Self-Test] Using KUBECONFIG=$KUBECONFIG"
}

# generate self-test.yaml with variable expansion
function yaml {
    echo "[Self-Test] Creating self-test.yaml"
    TEMP=$(mktemp)
    echo 'cat <<EOF' > $TEMP
    cat "$SCRIPTDIR"/self-test.yaml >> $TEMP
    echo 'EOF'       >> $TEMP
    bash $TEMP >> $YAML
    rm $TEMP
}

# delete the job and configmap (etc.)
function cleanup {
    echo "[Self-Test] Cleaning up prior deployments of self-test"
    tput setaf 5
    (kubectl delete -f $YAML || exit 0)
    tput sgr0
}

# build docker image of self-test just for this test and load it into
# kind
function build {
    tput setaf 3
    echo "[Self-Test] Building self-test image"
    tput sgr0
    FAST=true npm run build:docker:self-test
    tput setaf 3
    echo "[Self-Test] Loading image into kind image=$SELF_TEST_IMAGE cluster=$CLUSTER"
    tput sgr0
    kind load docker-image $SELF_TEST_IMAGE --name $CLUSTER
}

function start {
    tput setaf 3
    echo "[Self-Test] Deploying self-test image"
    tput sgr0
    kubectl apply -f "$YAML"
}

# wait for a pod (of the job) to be ready
function waitForReady() {
    tput setaf 3
    echo "[Self-Test] Waiting for job to start"
    tput sgr0
    kubectl wait pod -l job-name=codeflare-self-test --for=condition=Ready --timeout=240s
}

# stream out the logs of our job's pod(s)
function logs() {
    tput setaf 3
    echo "[Self-test] Streaming out job logs"
    tput sgr0
    kubectl logs -l job-name=codeflare-self-test -f
}

# wait for the self-test to complete
function waitForComplete() {
    tput setaf 3
    echo "[Self-test] Waiting for job completion"
    tput sgr0
    kubectl wait job codeflare-self-test --for=condition=complete --timeout=-1s
}

start_kind
yaml
cleanup
build
start
waitForReady
logs
waitForComplete
