# Developer Guide for the CodeFlare CLI

CodeFlare is written in [TypeScript](https://www.typescriptlang.org/),
and leverages the [Kui](https://github.com/kubernetes-sigs/kui)
framework to provide platform applications that can also be run as
hosted web applications.

For CodeFlare CLI developers, first create your own fork, then clone
it and start up the [webpack](https://webpack.js.org/) watcher:

```shell
git clone https://github.com/project-codeflare/codeflare-cli
cd codeflare-cli
npm ci
npm run watch
```

Now you may use `./bin/codeflare` to launch your local clone. The
watcher will recompile things when you make changes to TypeScript or
SCSS source files.
