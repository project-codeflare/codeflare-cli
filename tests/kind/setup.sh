#!/usr/bin/env bash

SCRIPTDIR=$(cd $(dirname "$0") && pwd)
. "$SCRIPTDIR"/values.sh

KUBECONFIG=$(mktemp)

(kind get clusters | grep -q $CLUSTER && echo "Skipping kind cluster creation: $CLUSTER" 1>&2 && kind get kubeconfig --name $CLUSTER > $KUBECONFIG) || \
    (echo "Creating kind cluster: $CLUSTER" 1>&2 && \
        kind create cluster --name $CLUSTER --kubeconfig $KUBECONFIG)

echo "$KUBECONFIG"
