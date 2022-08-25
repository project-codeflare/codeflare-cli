/*
 * Copyright 2022 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Asserted answers for --team=ibmfm */
export default {
  "Run Locally####Run on a Kubernetes Cluster": "Run on a Kubernetes Cluster",
  'expand((kubectl config get-contexts -o name | grep -E . >& /dev/null && kubectl config get-contexts -o name) || (kubectl version | grep Server >& /dev/null && echo "${KUBE_CONTEXT_FOR_TEST-In-cluster}" || exit 1), Kubernetes contexts)':
    ".+api-a100-large-openshiftv4test-ibmcloud-com.+",
  "expand([ -z ${KUBE_CONTEXT} ] && exit 1 || X=$([ -n \"$KUBE_NS_FOR_TEST\" ] && echo $KUBE_NS_FOR_TEST || kubectl ${KUBE_CONTEXT_ARG} get ns -o name || oc ${KUBE_CONTEXT_ARG} get projects -o name); echo \"$X\" | sed -E 's#(namespace|project.project.openshift.io)/##' | grep -Ev 'openshift|kube-', Kubernetes namespaces)####Create a namespace":
    "(?!Create a namespace).+",
  "Keep It Simple####Use the Ray Autoscaler####Use the Multi-user Enhanced Kubernetes Scheduler":
    "Use the Multi-user Enhanced Kubernetes Scheduler",
  "My administrator has already installed and configured MCAD####MCAD with the Advanced Coscheduler####MCAD with the Default Kubernetes Scheduler":
    "My administrator has already installed and configured MCAD",
}
