FROM ghcr.io/project-codeflare/pyarrow:0.0.4

ENV \
    DEBIAN_FRONTEND="noninteractive" \
    CONDA_ENV="lightning" \
    PATH="/root/miniconda3/bin:$PATH" \
    LD_LIBRARY_PATH="/root/miniconda3/lib:$LD_LIBRARY_PATH"

COPY requirements.txt requirements.txt

RUN unset LD_LIBRARY_PATH && \
    apt-get update -qq --fix-missing && \
    apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        cmake && \
    pip install -r requirements.txt && \
    # Cleaning
    apt-get remove -y \
        build-essential \
        ca-certificates \
        cmake && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /root/.cache && \
    rm -rf /var/lib/apt/lists/* && \
    chgrp -R 0 /root && \
    chmod -R g+rwX /root
