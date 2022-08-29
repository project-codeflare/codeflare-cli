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

| **Rapid Job Submission**                                                                                                           | **Optimized Inner Loop**                                                                                                                                                          | **Easy access to Pop-up Dashboards**                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codeflare` guides you through the complex process by posing a series of questions. Where is your source code? Where is your data? | You may name the set of answers you provided. We call this a **profile**. Your inner loop then becomes: `codeflare -y -p <profileName>`. The `-y` means accept all prior answers. | `codeflare` offers quick access to a variety of graphical dashboards, including MLFlow, Tensorboard, and a custom CodeFlare Dashboard that helps you track the progress of an individual job. |
| `codeflare` glues answers together and submits a Kubernetes job.                                                                   | You can switch quickly between profiles, and even submit jobs to distinct profiles concurrently.                                                                                  | There is no need to fiddle with yaml files and port forwards. With a few clicks, you will get a popup dashboard window.                                                                       |

## Installation

On macOS, if you have [HomeBrew](https://brew.sh/) installed:

    brew tap project-codeflare/codeflare-cli https://github.com/project-codeflare/codeflare-cli
    brew install codeflare

Otherwise, visit our
[Releases](https://github.com/project-codeflare/codeflare-cli/releases/latest)
page to download the zip file for your platform. Unzip and place the
enclosed `bin/` directory on your `PATH`.

</details>

## Contributing

Want to help out? Check out the [developer guide](./docs/development/README.md).
