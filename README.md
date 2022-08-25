[![CLI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml)
[![UI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml)
[![Kube Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml)

# CodeFlare Desktop Client

<p align="center">
<img src="./images/codeflare_cli.svg" width="200" height="200">
</p>

CodeFlare is a framework to simplify the integration, scaling and
acceleration of complex multi-step analytics and machine learning
pipelines on the cloud.

## Installation

```shell
brew tap project-codeflare/codeflare-cli https://github.com/project-codeflare/codeflare-cli
brew install codeflare
```

## Development

For codeflare-cli developers:

```shell
git clone https://github.com/project-codeflare/codeflare-cli
cd codeflare-cli
npm ci
npm run watch
```

Now you may use `./bin/codeflare` to launch your local clone. The
watcher will recompile things when you make changes to TypeScript or
SCSS source files.

### Docker

If you want to build a Docker image, this command will build a
production client (which takes around 30 seconds), and then build the
Docker image (which takes another few minutes).

```shell
npm run build:docker
```

If you want to skip the first step, and only test building the Docker
image, use `build:docker0`.

To test your image, try `./bin/codeflare -d`. If you want to debug the
image itself, use `npm run docker:debug` which will get you a shell
into a running container.

Limitations: the Docker build scripts are currently hard-wired to
x86. PRs welcome to leverage `docker buildx` to build for ARM, etc.

## License

CodeFlare CLI is an open-source project with an [Apache 2.0 license](LICENSE).
