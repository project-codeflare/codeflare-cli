#!/usr/bin/env bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

# name of the configmap
CM=codeflare-self-test-config

# we will test the latest **remote** version of the current local
# org+branch e.g. if your local branch is from org `starpit` and
# branch `fixing-bug`, then make sure to commit and push your changes
# to the remote, otherwise any changes you hoped to test will not be
# picked up
ORG=${GITHUB_REPOSITORY_OWNER-$(git config remote.$(git config branch.main.remote).url | cut -f2 -d: | cut -f1 -d/)}
BRANCH=$(git branch --show-current)
echo "github org=$ORG branch=$BRANCH"

# if you hit ctrl+c, we will tear everything down
trap cleanup INT

# configure kind if needed
function kind() {
    if [ -n "$NEEDS_KIND" ]; then
        export KUBECONFIG=$("$SCRIPTDIR"/../../tests/kind/setup.sh)
    fi
}

# delete the job and configmap (etc.)
function cleanup() {
    tput setaf 5
    kubectl delete cm $CM
    kubectl delete -f "$SCRIPTDIR"/self-test.yaml
    tput sgr0
}

# create the job and configmap (etc.)
function start() {
    # necessary to support cloning when run as a github action; the
    # cloning happens in self-test.sh, inside the running pod (spawned
    # by this apply)
    if [ -n "$GITHUB_ACTOR" ] && [ -n "$GITHUB_TOKEN" ]; then
        GITHUB_ACTOR_PREFIX="$GITHUB_ACTOR:$GITHUB_TOKEN@"
    fi

    tput setaf 5
    kubectl create cm $CM \
            --from-literal=ORG=$ORG \
            --from-literal=BRANCH=$BRANCH \
            --from-literal=VARIANTS=$VARIANTS \
            --from-literal=GITHUB_ACTOR_PREFIX=$GITHUB_ACTOR_PREFIX \
            --from-literal=GITHUB_SHA=$GITHUB_SHA \
            --from-literal=GITHUB_REF=$GITHUB_REF

    kubectl apply -f "$SCRIPTDIR"/self-test.yaml
    tput sgr0
}

# wait for a pod (of the job) to be ready
function waitForReady() {
    tput setaf 3
    echo "Waiting for job to start"
    tput sgr0
    kubectl wait pod -l job-name=codeflare-self-test --for=condition=Ready
}

# stream out the logs of our job's pod(s)
function logs() {
    tput setaf 3
    echo "Streaming out job logs"
    tput sgr0
    kubectl logs -l job-name=codeflare-self-test -f
}

function waitForComplete() {
    tput setaf 3
    echo "Waiting for job completion"
    tput sgr0
    kubectl wait pod -l job-name=codeflare-self-test --for=condition=Complete --timeout=-1s
}

kind
cleanup
start
waitForReady
logs
waitForComplete
