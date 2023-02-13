[![CLI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml)
[![UI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml)
[![Kube Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml)
[![Self-test Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml)

# The CodeFlare CLI

<p align="center">
  <img src="./images/codeflare_cli.svg" width="110" height="110" align="left">
</p>

[CodeFlare](https://codeflare.dev) simplifies the integration, scaling
and acceleration of complex multi-step analytics and machine learning
pipelines on the cloud.

This repository houses the CodeFlare CLI, `codeflare`, which helps
you to submit and observe jobs in a Kubernetes cluster.

[Check out some use cases in motion](./docs/scenarios/README.md#readme).

<a href="https://asciinema.org/a/518021" target="_blank"><img src="https://asciinema.org/a/518021.svg" height="175"/></a>
<a href="https://asciinema.org/a/517989" target="_blank"><img src="https://asciinema.org/a/517989.svg" height="175"/></a>
<a href="https://asciinema.org/a/517993" target="_blank"><img src="https://asciinema.org/a/517993.svg" height="175"/></a>

## How `codeflare` Works

The `codeflare` CLI is programmed with a set of tasks. Each task knows
how to **guide** you through the complexities of running against a
remote cluster. For example, `codeflare` tasks include submitting a
Ray job to a Kubernetes cluster, or observing such a running job.

The way `codeflare` guides you is by asking you questions. It tries
to formulate each question as a choice from a list of
possibilities. In this example, it attempts to list your available
Kubernetes clusters, and you need only select from that list. It does
the same kind of thing for S3 data (e.g. showing you a list of
available S3 buckets). Some questions require more free-form
responses. For example, when asking for the resource requirements of
your job, it presents a form that you can edit to specify how many
GPUs you need.

### Managing Profiles

The `codeflare` CLI remembers your answers to these questions in a
**profile**. This allows you to easily re-run a task using the same
answers as before: `codeflare -y/--yes`, which auto-accepts your prior
answers, as long as those answers are still valid. To run with a
profile name of your choosing, use the `-p/--profile` command line
option. In doing so, you may thus quickly switch between variants,
e.g. different input data, or different Kubernetes clusters.

To manage your profiles, use the `codeflare profile
<list|get|delete|clone>` command lines.

## Installation

Visit the
[Releases](https://github.com/project-codeflare/codeflare-cli/releases/latest)
page. Download the package for your platform, unpack it, and place the
enclosed `bin/` directory on your `PATH`. macOS users may use
[HomeBrew](https://brew.sh/):

    brew tap project-codeflare/codeflare-cli https://github.com/project-codeflare/codeflare-cli
    brew install codeflare

## Contributing

Want to help out? Check out the [developer guide](./docs/development/README.md).
