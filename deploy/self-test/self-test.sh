#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPTDIR=$(cd $(dirname "$0") && pwd)

echo "Starting CodeFlare self-test"

export KUBE_NS_FOR_REAL=$(kubectl get job codeflare-self-test -o custom-columns=NS:.metadata.namespace --no-headers)
echo "Kubernetes namespace: $KUBE_NS_FOR_REAL"

if [ -n "$VARIANTS" ]; then
    variants=$VARIANTS
else
    variants="gpu1 non-gpu1"
fi
echo "Using these variants: $variants"

for variant in $variants; do
    # for profile in ./tests/kind/profiles/*; do
    for profile in $variant/keep-it-simple; do
        echo "================== $profile =================="
        ./tests/kind/run.sh -i $profile
    done
done
