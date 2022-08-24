FROM node:lts-slim

LABEL org.opencontainers.image.source https://github.com/project-codeflare/codeflare-cli

ENV DEBIAN_FRONTEND=noninteractive
ENV KUI_HEADLESS=true
ENV KUI_HEADLESS_WEBPACK=true
ENV CODEFLARE_HEADLESS_HOME=/usr/local/CodeFlare

# TODO hard-coded arch
ADD dist/headless /usr/local/CodeFlare
ADD node_modules/@guidebooks/store/dist/store /usr/local/CodeFlare/store
ADD bin/codeflare /usr/local/bin/codeflare
ADD deploy/log-aggregator/wait-for.sh /usr/local/bin/wait-for
ADD deploy/log-aggregator/wait-for-and-cat.sh /usr/local/bin/wait-for-and-cat
ADD deploy/log-aggregator/wait-for-and-tailf.sh /usr/local/bin/wait-for-and-tailf

# Note, the `codeflare ...` commands are not strictly necessary. We do
# them here only to save some time installing these prereqs on every
# run.
RUN apt update && apt -y install sudo curl procps inotify-tools \
        && apt -y clean && rm -rf /var/lib/apt/lists/* \
        && adduser --disabled-password --gecos '' codeflare && adduser codeflare sudo && adduser root sudo && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
        && mkdir -p /root/.local/share/madwizard-nodejs/profiles \
        && codeflare -n util/jq \
        && codeflare -n util/websocat \
        && codeflare -n kubernetes/kubectl

#USER codeflare
WORKDIR /home/node

CMD exec /bin/bash -c "trap : TERM INT; sleep infinity & wait"
# ENTRYPOINT ["codeflare", "-y", "-p", "default", "ml/ray/aggregator/with-jobid"]


# Notes
# - KUBE_CONTEXT_ARG must be ""
# - KUBE_NS_ARG can be "" for kubectl, but since we need it for RAY_ADDRESS, use the actual `-n ${KUBE_NS}` value
# - RAY_ADDRESS must be of the form mycluster-ray-head.ray.svc.cluster.local:8265
#                                   $RAY_KUBE_CLUSTER_NAME.$KUBE_NS.svc.cluster.local:8265
#                                                           ^^^^^^^ must be the actual namespace value
