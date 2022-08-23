# Publishing Production Builds

## Gather Secrets

Copy [release-template.conf](release-template.conf) to
`~/.codeflare-release.ebv` i.e. in your home directory, and update it
with your secrets.

TODO explain how to get Apple code signing secrets.

## Install Dependencies

```shell
npm install -g release-it @release-it/conventional-changelog @release-it/bumper dotenv-cli
```

# Release!

1. It is recommended that you do this from a fresh clone, so that no
   development artifacts find their way into a production build.
2. Do not run `release-it` directly, instead use the npm script from
   the top level of this repository.

```shell
npm run release
```
