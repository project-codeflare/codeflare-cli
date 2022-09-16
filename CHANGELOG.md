## [0.12.2](https://github.com/project-codeflare/codeflare-cli/compare/v0.12.1...v0.12.2) (2022-09-16)

### Bug Fixes

- "create namespace" option causes odd failures ([1668d30](https://github.com/project-codeflare/codeflare-cli/commit/1668d308fb691e4f5c880625dcce36ace01ad04d))

## [0.12.1](https://github.com/project-codeflare/codeflare-cli/compare/v0.12.0...v0.12.1) (2022-09-14)

# [0.12.0](https://github.com/project-codeflare/codeflare-cli/compare/v0.11.4...v0.12.0) (2022-09-14)

### Bug Fixes

- bump to madwizard 0.22.1 to pick up zsh fixes ([1470339](https://github.com/project-codeflare/codeflare-cli/commit/14703395a2017ce5e45ece474901ea09ff28c686))
- robert self-test periodic.yaml wasn't in sync with fixes to once.yaml ([130fc8c](https://github.com/project-codeflare/codeflare-cli/commit/130fc8ca2c487e4f6b65ffa3cfab824e8de1cbe5))

### Features

- bump to @guidebooks/store to 0.10.x to pick up s3fs support for roberta ([602a0e5](https://github.com/project-codeflare/codeflare-cli/commit/602a0e5c3316c7e62659375d48872f1c38d94760))
- bump to kui 12.0.0 ([a88cb1e](https://github.com/project-codeflare/codeflare-cli/commit/a88cb1e7152aa47f0fb61019b54c88f9a4f42a32))

## [0.11.4](https://github.com/project-codeflare/codeflare-cli/compare/v0.11.3...v0.11.4) (2022-08-31)

### Bug Fixes

- update scenario 2 to use new ml/codeflare/training/roberta/demo ([ad11b37](https://github.com/project-codeflare/codeflare-cli/commit/ad11b37babf04daa92ce21f0f9e09c35776c2ec9))
- updates to restore self-test capability vs private repos ([6a7e366](https://github.com/project-codeflare/codeflare-cli/commit/6a7e3661be80ab157ae991f35db56226944b8cc9))

## [0.11.3](https://github.com/project-codeflare/codeflare-cli/compare/v0.11.2...v0.11.3) (2022-08-31)

### Bug Fixes

- bump to @guidebooks/store 0.7.2 to pick up roberta fix ([fbf6fa8](https://github.com/project-codeflare/codeflare-cli/commit/fbf6fa8e1090dce255c0ca63f6efe315ea8c0bc3))
- bump to @guidebooks/store@0.8.3 to pick up roberta outside of ibm fix ([ee8bc28](https://github.com/project-codeflare/codeflare-cli/commit/ee8bc282b5c631f51de3fe42f784bd26426face2))

## [0.11.2](https://github.com/project-codeflare/codeflare-cli/compare/v0.11.1...v0.11.2) (2022-08-31)

### Bug Fixes

- back out release-it bumper for yamls ([00cdcc3](https://github.com/project-codeflare/codeflare-cli/commit/00cdcc373decf973e539ca0e06b8fda10608894a))
- bump @guidebook/store to 0.6.5 to pick up roberta env var fixes ([bf7d5a5](https://github.com/project-codeflare/codeflare-cli/commit/bf7d5a5e99fb5bdb2917145edc1c98023d3fefab))
- bump to @guidebooks/store 0.6.7 to pick up roberta wordsmithing ([646d910](https://github.com/project-codeflare/codeflare-cli/commit/646d91005d5534b755cbaf7ba4db886acd6a65b7))
- bump to madwizard 0.21.4 to pick up fix for regression in support for getting started guidebooks ([7b7891f](https://github.com/project-codeflare/codeflare-cli/commit/7b7891f6cb39d419692d70ab56eb3e80cc0ee8a6))
- roberta self-test was not base64-decoding slack secrets ([3f3fad0](https://github.com/project-codeflare/codeflare-cli/commit/3f3fad0312907d0ab182b2eaa1c55c693a483937))

## [0.11.1](https://github.com/project-codeflare/codeflare-cli/compare/v0.11.0...v0.11.1) (2022-08-30)

### Bug Fixes

- `-t/--team` option should fail fast if the given team is not recognized ([f0bc0fe](https://github.com/project-codeflare/codeflare-cli/commit/f0bc0fe63ce89318a10763f776cba2465a50aa18))
- avoid tray menu "blinking" on linux ([c9ee70d](https://github.com/project-codeflare/codeflare-cli/commit/c9ee70dab87f43f96dd4ffe523d33c6d4cba58df))
- bump @guidebooks/store to 0.6.3 to pick up "workers 1/0" fix ([229ac78](https://github.com/project-codeflare/codeflare-cli/commit/229ac78422da767aa0e80b17c453094072b43e32))
- no window close button on linux and windows ([fa1b30e](https://github.com/project-codeflare/codeflare-cli/commit/fa1b30e8f313ff1cc85b7e0e377c8fe6baf7d788))
- release-it bumper should bump the self-test container versus in roberta self-test ([263f399](https://github.com/project-codeflare/codeflare-cli/commit/263f3995a2ddef09593a792f38879121a0c83341))
- roberta self-test cronjob does not properly specify history limit specs ([86ef6f4](https://github.com/project-codeflare/codeflare-cli/commit/86ef6f46b105d2ac12b43b8e99eed4b00bc1acf8))
- stop using getopts in bin/codeflare ([42382ab](https://github.com/project-codeflare/codeflare-cli/commit/42382abdf7ea9be477c40a99185ac949bb022f6c))
- tray menu does not appear in production builds on linux and windows ([cda2080](https://github.com/project-codeflare/codeflare-cli/commit/cda2080e5ffad64be54709c193a661b55a4e765a))

# [0.11.0](https://github.com/project-codeflare/codeflare-cli/compare/v0.10.0...v0.11.0) (2022-08-29)

### Bug Fixes

- bump madwizard and store to pick up --no-input fixes for roberta ([e59bee2](https://github.com/project-codeflare/codeflare-cli/commit/e59bee24dfb39fa2f5eaac7ec364985b21edda00))
- kind test runner does not properly clean up prior log aggregator deployments ([b541450](https://github.com/project-codeflare/codeflare-cli/commit/b541450d190733d0efce01648f20c97e29401e76))
- release-it does not properly set version on cask or docker ([37fde44](https://github.com/project-codeflare/codeflare-cli/commit/37fde444cd15e2135552f6b39c07f65879b886e4))
- release-it is not propagating version ([e9480f7](https://github.com/project-codeflare/codeflare-cli/commit/e9480f74d9acf287cdc4eb9ad315cae289eeeb33))
- roberta self-test doc needs to use raw githubcontent link ([fc6e047](https://github.com/project-codeflare/codeflare-cli/commit/fc6e04722726e8c4f0fcad86bc5fbe1a85c28da2))
- version command lacks trailing newline ([ed0ee57](https://github.com/project-codeflare/codeflare-cli/commit/ed0ee57ac63be183e27ee5dc9061bab17fde8a36))

### Features

- bump guidebook store and madwizard to pick up roberta ([fb02cae](https://github.com/project-codeflare/codeflare-cli/commit/fb02caefe7b431e2b97845b622dfd2df7dfd93f5))
- improved self-test capability (launch codeflare tests such that they run within the cluster) ([4444305](https://github.com/project-codeflare/codeflare-cli/commit/444430567281b6d10b2b50bc01ca7cb42d1f5852))
- robert self-test ([f2fbfd2](https://github.com/project-codeflare/codeflare-cli/commit/f2fbfd22b34e38ce2fe0bc23a5539281c8f0ef49))

# [0.10.0](https://github.com/project-codeflare/codeflare-cli/compare/v0.9.4...v0.10.0) (2022-08-25)

### Bug Fixes

- pin version of log aggregator to version of codeflare ([317c668](https://github.com/project-codeflare/codeflare-cli/commit/317c66877b876b8a262ea7fcf2fdb96abc81357b))
- release-it does not correctly publish cask updates ([8474e8b](https://github.com/project-codeflare/codeflare-cli/commit/8474e8bf5bed83d89fafa32328fb93ce20388e8e))

### Features

- allow management of assertions based on teams ([33d8729](https://github.com/project-codeflare/codeflare-cli/commit/33d87294d65dd36af0a4895e5dd29a5b5a31fee7))

## [0.9.4](https://github.com/project-codeflare/codeflare-cli/compare/v0.9.3...v0.9.4) (2022-08-23)

### Bug Fixes

- fixes for broken log aggregator ([e1d85ac](https://github.com/project-codeflare/codeflare-cli/commit/e1d85ace4c66653bac1281c7978b07c591dab165))
- i think this resolves remaining log aggregator instabilities ([f13312c](https://github.com/project-codeflare/codeflare-cli/commit/f13312c68d2e31a7645a00193b17229c1c0c9433))
- run the release-it scripts in verbose mode ([b9c510a](https://github.com/project-codeflare/codeflare-cli/commit/b9c510a28663c825cb76758500ae20e0bd4fbcea))
