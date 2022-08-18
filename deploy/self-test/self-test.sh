#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

if [ -n "$GITHUB_REF" ]; then
    echo "Cloning org=$ORG ref=$GITHUB_REF"
    mkdir test
    git init
    git remote add origin https://github.com/${ORG}/${REPO}
    git clone -c 'remote.origin.fetch=+refs/changes/*:${GITHUB_REF%/merge}/changes/*' https://${GITHUB_ACTOR_PREFIX}${GITHUB}/${ORG}/${REPO}.git test
    git -c protocol.version=2 fetch --no-tags --prune --progress --no-recurse-submodules --depth=1 origin +${GITHUB_SHA}:${GITHUB_REF}
else
    echo "Cloning org=$ORG branch=$BRANCH"
    git clone https://${GITHUB_ACTOR_PREFIX}${GITHUB}/${ORG}/${REPO}.git -b ${BRANCH} test
fi
cd test
npm ci
npm run build:headless

export KUI_HEADLESS=true
export KUI_HEADLESS_WEBPACK=true
export CODEFLARE_HEADLESS_HOME=$PWD/dist/headless

./bin/codeflare openshift/oc
./bin/codeflare kubernetes/kubectl

export KUBE_NS_FOR_REAL=$(kubectl get job codeflare-self-test -o custom-columns=NS:.metadata.namespace --no-headers)
echo "Kubernetes namespace: $KUBE_NS_FOR_REAL"

if [ -n "$VARIANTS" ]; then
    variants=$VARIANTS
else
    variants="gpu1 non-gpu"
fi
echo "Using these variants: $variants"

for variant in $variants; do
    # for profile in ./tests/kind/profiles/*; do
    for profile in $variant/keep-it-simple; do
        echo "================== $profile =================="
        ./tests/kind/run.sh -i $profile
    done
done
