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