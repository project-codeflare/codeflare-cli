# Guide for building multi-arch docker images

## Creating a `docker buildx` build config

To build for both amd64 and aarch4 (e.g. for running on Apple
Silicon), you can use `docker buildx`.

First, you will need to create a buildx config, because the default
one does not seem to work well for cross-platform builds. Here we name
that config `multiarch`, but it can be named anything.

We have found that using the `kubernetes` driver works better than the
default `docker-container` driver.

```shell
docker buildx create --name multiarch --use --driver kubernetes --driver-opt=qemu.install=true
```

The `--use` part tells buildx to set this as the default builder.

_Note_: We tell docker buildx to use qemu, so that the amd64 images
can be built on an aarch64 host.

_Warning_: If your KUBECONFIG env var is colon-separated, this is
something that `docker buildx` apparently does not support. You will
need to run any `docker buildx` commands with
e.g. `KUBECONFIG=~/.kube/config`, i.e. pointing it to a single
filepath.

## Starting a build

Now you should be able to build and push:

```shell
# whatever you need here, but note that the Dockerfiles
# may need to change, as you update these image names and tags
TAG=ghcr.io/project-codeflare/custodian:0.0.1

# build for aarch64 (arm64/v8) and amd64
PLATFORMS=linux/arm64/v8,linux/amd64

# note here that we build and push in one step; for some reason,
# buildx fails when only building
docker buildx build --push --platforms $PLATFORMS --tag $TAG .
```
