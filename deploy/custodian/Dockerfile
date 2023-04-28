FROM alpine/helm:3.11.3

LABEL org.opencontainers.image.source https://github.com/project-codeflare/codeflare-cli

RUN if [[ $(uname -m) = aarch64 ]]; then KUBECTL_ARCH=arm64; else KUBECTL_ARCH=amd64; fi; \
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/$KUBECTL_ARCH/kubectl" && \
        chmod a+rx kubectl && \
        mv kubectl /usr/local/bin && \
        wget -q -O /tmp/websocat https://github.com/vi/websocat/releases/download/v1.11.0/websocat.$(uname -m)-unknown-linux-musl && \
        chmod a+rx /tmp/websocat && \
        mv /tmp/websocat /usr/local/bin

ENTRYPOINT bash
