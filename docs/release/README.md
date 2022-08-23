# Publishing Production Builds

1. Copy [release-template.conf](release-template.conf) to `.release.conf`
   at the top level, and update it with your secrets.

2. Install dependencies:

```shell
npm install -g release-it @release-it/conventional-changelog @release-it/bumper dotenv-cli
```

3. Run `release-it`:

```shell
release-it
```
