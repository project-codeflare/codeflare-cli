FROM node:lts-bullseye-slim

LABEL org.opencontainers.image.source https://github.com/project-codeflare/codeflare-cli

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt -y install sudo curl python3 python3-pip python3-venv git \
        && pip3 install --no-cache-dir  -U pip && pip3 install --no-cache-dir -U setuptools \
        && apt -y clean && rm -rf /var/lib/apt/lists/*

ENV KUI_HEADLESS=true
ENV KUI_HEADLESS_WEBPACK=true
ENV NO_KIND=true
ENV ROOT=/usr/local
ENV NODE=node
ENV CODEFLARE_HEADLESS_HOME=/usr/local/CodeFlare

ADD dist/headless /usr/local/CodeFlare
ADD bin/codeflare /usr/local/bin/codeflare
ADD node_modules/@guidebooks/store/dist/store /usr/local/CodeFlare/store

RUN codeflare -n util/jq \
        && codeflare -n util/websocat \
        && codeflare -n ml/ray/install/cli \
        && codeflare -n openshift/oc \
        && codeflare -n kubernetes/helm3 \
        && codeflare -n kubernetes/kubectl

#USER codeflare
WORKDIR /home/node

ADD tests/kind /home/node/tests/kind
ADD deploy/self-test/self-test.sh /home/node/self-test.sh

ENTRYPOINT ["bash"]
CMD ["./self-test.sh"]
