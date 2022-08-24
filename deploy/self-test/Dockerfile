FROM node:lts-bullseye-slim

LABEL org.opencontainers.image.source https://github.com/project-codeflare/codeflare-cli

ENV DEBIAN_FRONTEND=noninteractive

ENV GITHUB=github.com
ENV ORG=project-codeflare
ENV REPO=codeflare-cli
ENV BRANCH=main

RUN apt update && apt -y install git python3 python3-pip build-essential curl sudo \
        && pip3 install --no-cache-dir  -U pip && pip3 install --no-cache-dir -U setuptools \
        && apt -y autoclean && apt -y clean && rm -rf /var/lib/apt/lists/* \
        && usermod -aG sudo node \
        && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER node
WORKDIR /home/node

ADD self-test.sh /home/node/self-test.sh

ENTRYPOINT ["bash"]
CMD ["./self-test.sh"]
