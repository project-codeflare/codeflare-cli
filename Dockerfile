FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH=/usr/local/CodeFlare/bin:$PATH

# TODO hard-coded arch
ADD dist/electron/CodeFlare-linux-x64 /usr/local/CodeFlare

# Note, the `codeflare ...` commands are not strictly necessary. We do
# them here only to save some time installing these prereqs on every
# run.
RUN apt update && apt -y install python3 python3-pip \
        && apt -y clean && rm -rf /var/lib/apt/lists/* \
        && codeflare util/jq \
        && codeflare util/websocat \
        && codeflare s3/install/cli \
        && codeflare ml/ray/install/cli \
        && codeflare kubernetes/kubectl \
        && codeflare kubernetes/helm3 \
        && adduser --disabled-password --gecos '' codeflare && adduser codeflare sudo && adduser root sudo && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
        && touch /home/codeflare/.codeflare 

ENTRYPOINT ["codeflare"]
WORKDIR /home/codeflare
USER codeflare




# in case we want to use the published production versions at some point...
#RUN export FILE=CodeFlare-linux-$([ "$(uname -m)" = "x86_64" ] && echo x64 || echo arm64) \
#        && apt update && apt -y install bash \
#        && curl -LO https://github.com/project-codeflare/codeflare-cli/releases/latest/download/$FILE.zip \
#        && unzip $FILE.zip \
#        && apt -y remove curl unzip && apt -y clean && rm -rf /var/lib/apt/lists/* \
#        && rm $FILE.zip \
#        && mv $FILE /usr/local/CodeFlare

