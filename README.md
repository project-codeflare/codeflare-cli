[![CLI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml)
[![UI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml)
[![Kube Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml)
[![Self-test Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml)

# CodeFlare Desktop Client

<p align="center">
<img src="./images/codeflare_cli.svg" width="110" height="110" align="left">
</p>

[CodeFlare](https://codeflare.dev) is a framework to simplify the
integration, scaling and acceleration of complex multi-step analytics
and machine learning pipelines on the cloud.

This repository is home to the open source CodeFlare CLI,
`codeflare`. On macOS, you can [get started
immediately](#installation) using `brew install`.

| **Rapid Job Submission**                                                                        | **Optimized Inner Loop**                                                                                                           | **Pop-up Dashboards**                                                                                                       |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `codeflare` guides you via a series of questions. Where is your data? How many GPUs are needed? | You may name the set of answers you provided. We call this a **profile**. Your inner loop becomes: `codeflare -y -p <profileName>` | `codeflare` offers convenient access to MLFlow, Tensorboard, and a custom dashboard that tracks a job's resources and logs. |
| `codeflare` glues answers together and submits a Kubernetes job.                                | Quickly switch between profiles. Submit concurrent jobs to distinct profiles.                                                      | No fiddling with yaml and port forwards. With a few clicks, a dashboard window pops open.                                   |

## Scenarios

Interested in finding use cases that match up with your own? Check out our [Scenarios](./docs/scenarios/#readme) page.

## Tray Menu

<img align="right" width="275" src="docs/images/tray/activeruns.png">

The CodeFlare tray menu offers quick access to the most common
features. On macOS and Linux, the menu will appear the upper right of
your menubar, as shown in the screenshot to the right.

To launch the CodeFlare tray menu from your terminal, try `codeflare hello`. You should now see a `CF` tray menu.

## Installation

On macOS, if you have [HomeBrew](https://brew.sh/) installed:

    brew tap project-codeflare/codeflare-cli https://github.com/project-codeflare/codeflare-cli
    brew install codeflare

Otherwise, visit our
[Releases](https://github.com/project-codeflare/codeflare-cli/releases/latest)
page to download the zip file for your platform. Unzip and place the
enclosed `bin/` directory on your `PATH`.

## Command Line Options

- `-y/--yes`: Repeat a prior run using all of the same answers, without any prompts.
- `-p/--profile`: Use a named profile. By default, your choices will be stored in a profile named "default".
- `-t/--team`: We have support for specializing the CLI towards specific clusters. Contact your admin for a preferred team name.
- `-V`: this will provide verbose output of the tool's operation.

## Contributing

Want to help out? Check out the [developer guide](./docs/development/README.md).
