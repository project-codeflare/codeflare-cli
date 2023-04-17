FROM alpine/helm:3.11.3

LABEL org.opencontainers.image.source https://github.com/project-codeflare/codeflare-cli

RUN if [[ $(uname -m) = aarch64 ]]; then KUBECTL_ARCH=arm64; else KUBECTL_ARCH=amd64; fi; curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/$KUBECTL_ARCH/kubectl" && \
        chmod a+rx kubectl && \
        mv kubectl /usr/local/bin

ENTRYPOINT bash
