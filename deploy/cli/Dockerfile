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

RUN apt update && apt -y install python3 python3-pip sudo curl \
        && apt -y clean && rm -rf /var/lib/apt/lists/* \
        && (cd /usr/bin && ln -s pip3 pip) \
        && adduser --disabled-password --gecos '' codeflare && adduser codeflare sudo && adduser root sudo && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
        && mkdir -p /root/.local/share/madwizard-nodejs/profiles \
        && codeflare -n util/jq \
        && codeflare -n util/websocat \
        && codeflare -n s3/install/cli \
        && codeflare -n ml/ray/install/cli \
        && codeflare -n kubernetes/kubectl \
        && codeflare -n kubernetes/helm3

USER codeflare
WORKDIR /home/codeflare

# Note, the `codeflare ...` commands are not strictly necessary. We do
# them here only to save some time installing these prereqs on every
# run.

# in case we want to use the published production versions at some point...
#RUN export FILE=CodeFlare-linux-$([ "$(uname -m)" = "x86_64" ] && echo x64 || echo arm64) \
#        && apt update && apt -y install bash \
#        && curl -LO https://github.com/project-codeflare/codeflare-cli/releases/latest/download/$FILE.zip \
#        && unzip $FILE.zip \
#        && apt -y remove curl unzip && apt -y clean && rm -rf /var/lib/apt/lists/* \
#        && rm $FILE.zip \
#        && mv $FILE /usr/local/CodeFlare

