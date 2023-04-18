FROM ubuntu:20.04

ARG PYTHON_VERSION=39
ARG CONDA_VERSION=4.9.2
ARG TARGETARCH

ENV \
    DEBIAN_FRONTEND="noninteractive" \
    CONDA_ENV="lightning" \
    PATH="/root/miniconda3/bin:$PATH" \
    LD_LIBRARY_PATH="/root/miniconda3/lib:$LD_LIBRARY_PATH"

COPY requirements.txt requirements.txt

RUN echo "TARGETARCH=$TARGETARCH" && \
    if [ "$TARGETARCH" = "arm64" ]; then TARGETARCH="aarch64"; else TARGETARCH="x86_64"; fi && \
    echo "TARGETARCH=$TARGETARCH" && \
    apt-get update -qq --fix-missing && \
    apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        git \
        jq \
        libopenmpi-dev \
        unzip \
        wget \
    && \
    # Install conda and python.
    # NOTE new Conda does not forward the exit status... https://github.com/conda/conda/issues/8385
    curl -o ~/miniconda.sh https://repo.anaconda.com/miniconda/Miniconda3-py${PYTHON_VERSION}_${CONDA_VERSION}-Linux-${TARGETARCH}.sh && \
    chmod +x ~/miniconda.sh && \
    ~/miniconda.sh -b && \
    rm ~/miniconda.sh && \
    pip install -r requirements.txt && \
    # Cleaning
    apt-get remove -y \
        build-essential \
        ca-certificates \
        cmake \
        curl \
        git \
        jq \
        libopenmpi-dev \
        unzip \
        wget && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /root/.cache && \
    rm -rf /var/lib/apt/lists/* && \
    chgrp -R 0 /root && \
    chmod -R g+rwX /root
