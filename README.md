[![CLI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml)
[![UI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml)
[![Kube Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml)
[![Self-test Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml)

# The CodeFlare CLI

<p align="center">
  <img src="./images/codeflare_cli.svg" width="110" height="110" align="left">
</p>

<a href="https://asciinema.org/a/518021" target="_blank"><img src="https://asciinema.org/a/518021.svg" width="300" align="right"/></a>

[CodeFlare](https://codeflare.dev) is a framework to simplify the
integration, scaling and acceleration of complex multi-step analytics
and machine learning pipelines on the cloud.

This repository is home to the open source CodeFlare CLI,
`codeflare`. This CLI helps you to submit and observe jobs in a
Kubernetes cluster.

[Check out some use cases in motion](./docs/scenarios/README.md#readme).

<a href="https://asciinema.org/a/517993" target="_blank"><img src="https://asciinema.org/a/517993.svg" width="300" align="right"/></a>

## Installation

Please visit the
[Releases](https://github.com/project-codeflare/codeflare-cli/releases/latest)
page to download the package for your platform, unpack it, and place
the enclosed `bin/` directory on your `PATH`. macOS users may use
[HomeBrew](https://brew.sh/) to expedite installation:

    brew tap project-codeflare/codeflare-cli https://github.com/project-codeflare/codeflare-cli
    brew install codeflare

<a href="https://asciinema.org/a/517989" target="_blank"><img src="https://asciinema.org/a/517989.svg" width="300" align="right"/></a>

## Command Line Options

- `-y/--yes`: Repeat a prior run using all of the same answers, without any prompts.
- `-p/--profile`: Use a named profile. By default, your choices will be stored in a profile named "default".
- `-V`: this will provide verbose output of the tool's operation.

## Contributing

Want to help out? Check out the [developer guide](./docs/development/README.md).
