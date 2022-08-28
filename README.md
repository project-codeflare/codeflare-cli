[![CLI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/cli.yml)
[![UI Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/ui.yml)
[![Kube Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/kind.yml)
[![Self-test Tests](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml/badge.svg)](https://github.com/project-codeflare/codeflare-cli/actions/workflows/self-test.yml)

# CodeFlare Desktop Client

<p align="center">
<img src="./images/codeflare_cli.svg" width="100" height="100" align="left">
</p>

[CodeFlare](https://codeflare.dev) is a framework to simplify the
integration, scaling and acceleration of complex multi-step analytics
and machine learning pipelines on the cloud.

This repository is home to the open source CodeFlare CLI,
`codeflare`. On macOS, you can [get started
immediately](#installation) using `brew install`.

## Highlights

- **Easy job submission against Kubernetes**: `codeflare` guides you
  through the complex process by posing a series of questions (where
  is your source code? where is your data?). `codeflare` has the
  smarts to glue all of these answers together, culminating in a
  running job.

- **Optimized Inner Loop**: You may give a name to the set of answers
  you provided. We call this a "profile". Your inner loop of jobs
  submission can thus be optimized by running `codeflare -y -p <profileName>` (the `-y` meaning auto-answer "yes" to accept all
  prior answers). This also allows you to switch quickly between
  profiles, and even submit jobs to distinct profiles concurrently.

- **Pop-up Graphical dashboards with a few keystrokes or clicks**:
  `codeflare` leverages the power of
  [Kui](https://github.com/kubernetes-sigs/kui) to offer you quick
  access to a variety of graphical dashboards, including MLFlow,
  Tensorboard, and a custom CodeFlare Dashboard that helps you track
  the progress of an individual job. There is no need to fiddle with
  yaml files and port forwards. With a few clicks, you will get a
  popup window that shows you the chosen dashboard.

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
