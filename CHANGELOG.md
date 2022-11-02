## [1.0.3](https://github.com/project-codeflare/codeflare-cli/compare/v1.0.2...v1.0.3) (2022-11-02)

### Bug Fixes

- add abbreviations Minimum->Min, Maximum->Max ([c6dc9a7](https://github.com/project-codeflare/codeflare-cli/commit/c6dc9a7910da3cc632fde102f918def4cd71a6e9))
- bump to madwizard@1.6.5 to pick up updated Choice messaging ([b64aea4](https://github.com/project-codeflare/codeflare-cli/commit/b64aea46997c44bbb033b8ee8c74d2aa8451c990))
- in tray openDashboard, use verbose mode if DEBUG is set ([89246f2](https://github.com/project-codeflare/codeflare-cli/commit/89246f259639d64f374475fb28b224d0be2ac5ed))
- increase default size of window to 1400x1050 ([7c4bdb0](https://github.com/project-codeflare/codeflare-cli/commit/7c4bdb01ba3a02830508cba3d41b8df57191e54b))
- remove Gallery from hello guidebook ([d33dbf9](https://github.com/project-codeflare/codeflare-cli/commit/d33dbf913f090870fd0116e2e6f67b9390496afe))

## [1.0.2](https://github.com/project-codeflare/codeflare-cli/compare/v1.0.1...v1.0.2) (2022-10-26)

### Bug Fixes

- bump to @guidebooks/store@0.15.2 to pick up more pvc fixes ([c2b8bb2](https://github.com/project-codeflare/codeflare-cli/commit/c2b8bb220a8e2afa31be9ca2a40983a058f363a3))

## [1.0.1](https://github.com/project-codeflare/codeflare-cli/compare/v1.0.0...v1.0.1) (2022-10-25)

### Bug Fixes

- update to @guidebooks/store@0.15.1 to pick up aws/auth fix ([a9fb177](https://github.com/project-codeflare/codeflare-cli/commit/a9fb177e235733fa765a05e1710429f281f4ae4e))

# [1.0.0](https://github.com/project-codeflare/codeflare-cli/compare/v0.14.2...v1.0.0) (2022-10-25)

### Bug Fixes

- add geo and provider rules to ProfileExplorer ([8a422c6](https://github.com/project-codeflare/codeflare-cli/commit/8a422c62ba50038ec78bc5afab50ffdc24e65999))
- add support for constraints/workload/checkpointable ([cc85228](https://github.com/project-codeflare/codeflare-cli/commit/cc85228119c235c1230458c5b049db98379ce07c))
- allocate less space to ProfileExplorer ([d4d39d6](https://github.com/project-codeflare/codeflare-cli/commit/d4d39d656b51c5d0e846c237e72c68532af6ebb8))
- allow clients to disable the tray menu ([25c19b6](https://github.com/project-codeflare/codeflare-cli/commit/25c19b6d2401e03661a24766183c4fa0f1a45361))
- another fix for profiles-path option; it wasn't always taking ([a424db4](https://github.com/project-codeflare/codeflare-cli/commit/a424db4bb5794098c66e4bdc1c59e14118ee6575))
- another minor refinement to 'all constraints satisfied' subtext ([6d1efc6](https://github.com/project-codeflare/codeflare-cli/commit/6d1efc655abe50516c0f0caf796967cbba274f3f))
- avoid hard-coding "codeflare.min.js" in respawn controller ([1a1442d](https://github.com/project-codeflare/codeflare-cli/commit/1a1442d0daca6290b5ceecdcc38977feb7338ca7))
- bump @guidebooks/store from 0.14.1 to 0.14.3 ([4fe63d6](https://github.com/project-codeflare/codeflare-cli/commit/4fe63d65b0595792c9d5ad55e79ca8c661d339bd))
- bump to @guidebooks/store 0.14.1 to pick up ns-with-context fix ([47a5348](https://github.com/project-codeflare/codeflare-cli/commit/47a534889bd92b37a630ed49f30b3981b475644e))
- bump to @guidebooks/store@0.15.0 to pick up s3fs pvc fix ([e6b74b3](https://github.com/project-codeflare/codeflare-cli/commit/e6b74b343e680af317c1779eef3134619a929091))
- bump to madwizard 1.4.x to pick up initial clear and no yellow fixes ([881a985](https://github.com/project-codeflare/codeflare-cli/commit/881a985355cbdba2c10af7aae89a317ad5d00b21))
- bump to madwizard@1.3.2 to pick up fix for last choice not being persisted ([a328e46](https://github.com/project-codeflare/codeflare-cli/commit/a328e46dec9f81c33086fad8515c9876f1eae2aa))
- bump to madwizard@1.6.1 to pick up tilde expansion fix ([0ac903a](https://github.com/project-codeflare/codeflare-cli/commit/0ac903a190d94f772bdb6b7df8ef4a254f08fcfc))
- bump to madwizard@1.6.2 to pick up multiselect validate fix ([bd79145](https://github.com/project-codeflare/codeflare-cli/commit/bd7914543c699511d0fb1b56cc32bae2d8152ec7))
- bump to madwizard@1.6.3 to pick up validate bug fix against single-select ([53a8863](https://github.com/project-codeflare/codeflare-cli/commit/53a8863b8b159e900cb2cbee9a98eb749a6d061b))
- bump to madwizard@1.6.4 to pick up guidebook ordering bug fix ([a4ae32a](https://github.com/project-codeflare/codeflare-cli/commit/a4ae32a67b6e5dbb653df20ca825befdd2ccd85e))
- change default fontSizeAdjust in Terminal to 16/14 ([7e47e3c](https://github.com/project-codeflare/codeflare-cli/commit/7e47e3c7fd3ea588544c4c2d77cc6e044c698bce))
- clean up ProfileExplorer by avoiding singleton Card UI ([9e1c967](https://github.com/project-codeflare/codeflare-cli/commit/9e1c96745b06f8ecdc8a3911999ac935fca9959c))
- don't use chips in ProfileExplorer ([d2b7edc](https://github.com/project-codeflare/codeflare-cli/commit/d2b7edcc53dd3342f6ef7a83e471c761fab32cee))
- don't use isLarge for ProfileExplorer card ([c633629](https://github.com/project-codeflare/codeflare-cli/commit/c633629741aa6214360fc1fdc7e87075d99159db))
- export fontSizeAdjust Terminal property ([4d013d7](https://github.com/project-codeflare/codeflare-cli/commit/4d013d7aa0e41befab3f4e7e5d950ef08de720fd))
- expose `codeflare delete profile <profileName>` ([42646ee](https://github.com/project-codeflare/codeflare-cli/commit/42646ee2e9005a809b45fb76aa78b27887bc61b1))
- fully disable profile status watcher ([adcaa3a](https://github.com/project-codeflare/codeflare-cli/commit/adcaa3aeb52c7beffdc35a58d195098f4c018ade))
- improve phrasing for Application in ProfileExplorer ([06c9283](https://github.com/project-codeflare/codeflare-cli/commit/06c9283153b2453a4e21f8795b183ed63fe9bf22))
- improve phrasing of 'all constraints have been satisfied' message ([4aa3df1](https://github.com/project-codeflare/codeflare-cli/commit/4aa3df1aa229d3f2bde58d14796a7f586817d3f7))
- improve visualization of just-changed attributes in ProfileExplorer ([b28651b](https://github.com/project-codeflare/codeflare-cli/commit/b28651bf6f2c376ca327c6ab6281ec5b5cc1fabc))
- improved spacing in tree view in ProfileExplorer ([c1f5f56](https://github.com/project-codeflare/codeflare-cli/commit/c1f5f56507dde54bc37d33b79809639ce7a73613))
- improved wrapping rules for ProfileExplorer ([28af9e7](https://github.com/project-codeflare/codeflare-cli/commit/28af9e794db6f11c8cbea071c232e23eb112187e))
- in graphical guide mode, ask madwizard to clear screen between choices ([eefde15](https://github.com/project-codeflare/codeflare-cli/commit/eefde15c1f698cd2322f54ece2e86acad0543e0e))
- in ProfileExplorer place profile select in footer ([86ac7c6](https://github.com/project-codeflare/codeflare-cli/commit/86ac7c6cedc59eedad1f9d31fc27114c83e67028))
- in ProfileExplorer, move actions to kebab and out of footer ([8cbbb10](https://github.com/project-codeflare/codeflare-cli/commit/8cbbb10c815537dc8472457e01c47390788f42bc))
- missed one spot that was hard-coding default guidebook ([b9aade6](https://github.com/project-codeflare/codeflare-cli/commit/b9aade6e211eae5ff75fcb488fb607968179867f))
- pass through fontSizeAdjust prop from RestartableTerminal to Terminal ([ca6b5d4](https://github.com/project-codeflare/codeflare-cli/commit/ca6b5d4a5b33a8dd2c6bf6e63433fb809c771e7e))
- ProfileExplorer card should fill width ([d84c373](https://github.com/project-codeflare/codeflare-cli/commit/d84c3732b2186eff753efc9723b785390cbeb9f6))
- ProfileExplorer chip text may have low contrast ([548caa5](https://github.com/project-codeflare/codeflare-cli/commit/548caa571e030fd5eb1f91bb714f3dd2e63787fa))
- ProfileExplorer does not highlight keys that were just added ([d19271a](https://github.com/project-codeflare/codeflare-cli/commit/d19271abd12def43decf850088e2ff5fa9707bb8))
- ProfileExplorer doesn't fully respond to font size changes ([469f85b](https://github.com/project-codeflare/codeflare-cli/commit/469f85b88a21063ea40713b981656e9c7a0643f3))
- ProfileExplorer dropdown menu item onclicks don't fire ([8f7ecfb](https://github.com/project-codeflare/codeflare-cli/commit/8f7ecfb89d79ab41a96c69dcae5b7f75e91c17d9))
- ProfileExplorer gives react duplicate key warning ([187b7dd](https://github.com/project-codeflare/codeflare-cli/commit/187b7ddcf66ef59d7cac168552c2bc7aa7dc4e1f))
- ProfileExplorer kebab dropdown stays open even after clicking outside ([568e9e4](https://github.com/project-codeflare/codeflare-cli/commit/568e9e4dbfdb7a4f238d2db39e9eef96d7e97d43))
- ProfileExplorer kebab menu needs background color ([8fdc89b](https://github.com/project-codeflare/codeflare-cli/commit/8fdc89bf1604a0aeb70b16f02e7f49918ee0e309))
- ProfileExplorer kube context text may result in horizontal overflow ([21eef6c](https://github.com/project-codeflare/codeflare-cli/commit/21eef6ca73eb909516851c201fb76790420e6ad2))
- ProfileExplorer leaf nodes use inconsistent text color ([1b7e9ee](https://github.com/project-codeflare/codeflare-cli/commit/1b7e9ee8190a753c6cd7d14dd1bd7157d2f6b906))
- ProfileExplorer mis-renders multiselect answers with numeric keys ([63f1636](https://github.com/project-codeflare/codeflare-cli/commit/63f1636d41eafcf14e0d103c49178ba6686a007a))
- ProfileExplorer profile select text has low contrast in dark themes ([7f30213](https://github.com/project-codeflare/codeflare-cli/commit/7f302130d3ca6a47d02859190a4988e859a90301))
- ProfileExplorer select has odd vertical centering due to use of Title ([54cd73d](https://github.com/project-codeflare/codeflare-cli/commit/54cd73d1f5a12589654724971406cff9862948a0))
- ProfileExplorer should sort the tree nodes to offer a consistent ordering ([2e77681](https://github.com/project-codeflare/codeflare-cli/commit/2e776817225dfc16546bdb9465b94168772a14b3))
- profiles in tray menu may show duplicates ([fb9face](https://github.com/project-codeflare/codeflare-cli/commit/fb9faced91a9847eaba2394717058bf6dac5367f))
- restore use of chip ui in ProfileExplorer ([49d5c3a](https://github.com/project-codeflare/codeflare-cli/commit/49d5c3ae64ca64ff6288e9abd3a80cb1a363b664))
- shorten wording of Compute and Storage dimensions in ProfileExplorer ([c797c6c](https://github.com/project-codeflare/codeflare-cli/commit/c797c6cceabf41e181bf75ceb0cc8c8b39ddcdbc))
- slightly increase default font size of terminal ([6d5e038](https://github.com/project-codeflare/codeflare-cli/commit/6d5e03804fef7e76522706ad9b3216a578c6357b))
- Specification -> Draft Specification ([174a997](https://github.com/project-codeflare/codeflare-cli/commit/174a99723639fae164f962b2733f3fc7c89266a5))
- stop hard-coding default guidebook ([4654609](https://github.com/project-codeflare/codeflare-cli/commit/4654609ce7032fa3471e57b62811a9dd5a974133))
- stop using the persona icon in ProfileSelect ([e210059](https://github.com/project-codeflare/codeflare-cli/commit/e2100590ad9f9e0b3f9b27bf33b4fd05027eb0ae))
- terminal component does not re-render if only noninteractive bit changes ([50cc373](https://github.com/project-codeflare/codeflare-cli/commit/50cc373d4d2bff5b282e82d80b51041ab155a2bc))
- terminal component does not restart if given different extraEnv ([e4cc00a](https://github.com/project-codeflare/codeflare-cli/commit/e4cc00a70e9e8d6a167e8386376da3f9436a9807))
- Terminal component still has toolbar UI even when `searchable===false` ([1e66ac4](https://github.com/project-codeflare/codeflare-cli/commit/1e66ac4a6287d7eb9a9bcd374e8637cdb1f65201))
- terminal does not refresh if only noninteractive bit changed ([21297d6](https://github.com/project-codeflare/codeflare-cli/commit/21297d6eb7081a6ad76ca8ab79c0c21608b21bff))
- terminal gives react warning from getDerivedStateFromProps() ([0792103](https://github.com/project-codeflare/codeflare-cli/commit/07921034d74a2afb86a1d424c8d73ce82c0828d4))
- Terminal was not using truly bold font ([0b213d3](https://github.com/project-codeflare/codeflare-cli/commit/0b213d3fbdbc340966002d924fc74b103e71a0fa))
- UI hangs with spinners for first-time users ([cb57f26](https://github.com/project-codeflare/codeflare-cli/commit/cb57f26f14703f224e6d97fee6f6a69ce4572962))
- UI should distinguish pending from offline ([d3bdc78](https://github.com/project-codeflare/codeflare-cli/commit/d3bdc78c5d3c8fba4840f9c8a8a4030a56f5950e))
- update ProfileExplorer just-updated to use green check rather than red exclamation ([197e63d](https://github.com/project-codeflare/codeflare-cli/commit/197e63ddab5dee45e9462715105862d62c219b7e))
- update ProfileExplorer to allow "editing" of aspects of the profile ([0b7eb6f](https://github.com/project-codeflare/codeflare-cli/commit/0b7eb6fa9f6f313a0782e42cfe2de6b02f05a4a1))
- use 'Credentials Profile' rather than 'AWS Profile' in ProfileExplorer ([d05b654](https://github.com/project-codeflare/codeflare-cli/commit/d05b6541ff3048eac18062ef73dae1874f33b12a))
- use normal repl background color for ProfileExplorer ([3854dd5](https://github.com/project-codeflare/codeflare-cli/commit/3854dd595c6ef5f3744d1c21cfcb59660f844d34))

### Features

- add 'Got it' button to dismiss terminal section ([5225375](https://github.com/project-codeflare/codeflare-cli/commit/5225375466e84b0b94baf6a0ac33da339c77f97a))
- add `fontSizeAdjust` property to Terminal component ([13eb415](https://github.com/project-codeflare/codeflare-cli/commit/13eb4152deec7e0af4c359234b4a5db054d2d71b))
- add SLA rule to ProfileExplorer ([0ec5884](https://github.com/project-codeflare/codeflare-cli/commit/0ec5884ad68151ccb6b29dc0cf8fd34b245711a4))
- add support for storage cloud provider to ProfileExplorer ([63e2daf](https://github.com/project-codeflare/codeflare-cli/commit/63e2daf2968498188dd40c688a8ac2b66e18638d))
- allow callers to provide `null` guidebook to terminal, and show EmptyState if so ([ea6aefd](https://github.com/project-codeflare/codeflare-cli/commit/ea6aefd1a17711fa9ec150330ab3f0c9e874baeb))
- allow terminal search feature to be disabled ([cc83582](https://github.com/project-codeflare/codeflare-cli/commit/cc83582a5cf039876a474a32ceeb285364f9cdcc))
- bump to madwizard 1.0.0 ([9a566c8](https://github.com/project-codeflare/codeflare-cli/commit/9a566c83a9f65b3e7359ed3abae25e2203ccd934))
- bump to madwizard 1.5.0 to pick up multiselect support ([e565409](https://github.com/project-codeflare/codeflare-cli/commit/e56540954b309d1ef85b21171e340106421d0a7c))
- change terminal to support _above_ terminal rather than _below_ terminal component ([b51bfc4](https://github.com/project-codeflare/codeflare-cli/commit/b51bfc4ee58b28419d974feb2f95d206c86dca05))
- expose `--profiles-path` madwizard option ([d25b805](https://github.com/project-codeflare/codeflare-cli/commit/d25b80543996475588080441579e4dd7bcdd229b))
- extend support in ProfileExplorer for finer-grain geo constraints ([b8fc0a0](https://github.com/project-codeflare/codeflare-cli/commit/b8fc0a01e3f36e89e1d773422563487088f832a9))
- New and Delete buttons in ProfileExplorer ([5b110f8](https://github.com/project-codeflare/codeflare-cli/commit/5b110f8837be2e3ddefe6d209841cc31a3be4258))
- propagate `onSelectProfile` handler from terminal to ProfileExplorer ([547635d](https://github.com/project-codeflare/codeflare-cli/commit/547635dd5ec8d7b8594e916cce844557c19deda1))
- remove untested s3 commands in plugin-codeflare ([1e3d42b](https://github.com/project-codeflare/codeflare-cli/commit/1e3d42b14f254b072d178d58f2c71fe951a9ba45))
- update ProfileExplorer to have a reset button ([3571e5d](https://github.com/project-codeflare/codeflare-cli/commit/3571e5d409dd1d5a03d1d65b9f25bd48dc32186e))
- update terminal component to accept an extraEnv prop to pass through to guidebook exec ([a18d19b](https://github.com/project-codeflare/codeflare-cli/commit/a18d19bbf2fe4e77f74be8e1dd3ea0e7e969630b))
- update terminal component to allow `belowTerminal` content ([510cc68](https://github.com/project-codeflare/codeflare-cli/commit/510cc680fd8b8d0f2a9370a9b182dd944b8b2899))
- update terminal componetry to support onExit execution of custom guidebooks ([e21fcce](https://github.com/project-codeflare/codeflare-cli/commit/e21fcce83baa78b5db488f78a22c37dd8f9f8f99))
- updated UI for ProfileExplorer ([f6d4669](https://github.com/project-codeflare/codeflare-cli/commit/f6d46695ef0c0037831ab5ca353d63b88076c353))

### BREAKING CHANGES

- this version of madwizard updates the profile keys in a way that renders prior profiles invalid.
- this version of madwizared necessitates guidebook to use import rather than inlining for sub-guidebooks that offer the user a choice. this is done so that each choice can be easily scoped based on the filepath of that guidebook within the store hierarchy.

## [0.14.2](https://github.com/project-codeflare/codeflare-cli/compare/v0.14.1...v0.14.2) (2022-09-19)

### Bug Fixes

- avoid bumping profile lastUsedTime for tray menu watchers ([f356434](https://github.com/project-codeflare/codeflare-cli/commit/f35643446fcaa435e824c9a66e8f59462b0985db))
- pin openshift to 4.10.33 (from @guidebooks/store 0.12.6) ([185c7b0](https://github.com/project-codeflare/codeflare-cli/commit/185c7b0eb20f04e42770100f88c6a84f3d4790c8))

## [0.14.1](https://github.com/project-codeflare/codeflare-cli/compare/v0.14.0...v0.14.1) (2022-09-19)

### Bug Fixes

- pick up fixes for roberta from @guidebooks/store 0.12.5 ([2dddaec](https://github.com/project-codeflare/codeflare-cli/commit/2dddaeca2ec8c46557f19ea751de97b0bbf2e3ba))

# [0.14.0](https://github.com/project-codeflare/codeflare-cli/compare/v0.13.1...v0.14.0) (2022-09-18)

### Bug Fixes

- after exit codeflare UI leaves dangling watcher processes ([7e8837e](https://github.com/project-codeflare/codeflare-cli/commit/7e8837e2ecb578d64a5afff63f872b83cef381cf))
- respawn uses incorrect (Renderer) executable when called from UI mode ([ee16c63](https://github.com/project-codeflare/codeflare-cli/commit/ee16c63dc56589fe2a9c01281fc8c4b951ba4746))
- status watcher exit may cause exponential cascade of subprocess spawning ([c39d6a5](https://github.com/project-codeflare/codeflare-cli/commit/c39d6a51fda3f10ddf7253a37897c5d7770c240b))

### Features

- add status dropdown with watcher support ([534c94f](https://github.com/project-codeflare/codeflare-cli/commit/534c94fdf3928bc426b5f150732483fbc256c725))

## [0.13.1](https://github.com/project-codeflare/codeflare-cli/compare/v0.13.0...v0.13.1) (2022-09-16)

### Bug Fixes

- bump to @guidebooks/store 0.12.4 to pick up pip3 fix ([584cff8](https://github.com/project-codeflare/codeflare-cli/commit/584cff84cf68063c810b6696bbbe082391edd802))

# [0.13.0](https://github.com/project-codeflare/codeflare-cli/compare/v0.12.2...v0.13.0) (2022-09-16)

### Bug Fixes

- bin/codeflare's use of apt needs sudo ([cf73080](https://github.com/project-codeflare/codeflare-cli/commit/cf73080b89d8592fec7310b8ca5581fb16e31028))
- bump to madwizard 0.22.2 to pick up windowsHide fix ([c5b8f0e](https://github.com/project-codeflare/codeflare-cli/commit/c5b8f0e10b001ef0359c0af963bf98eb7a8a8e7f))
- some variants of launching production builds can result in infinite loops and bad spawn paths ([675c6ad](https://github.com/project-codeflare/codeflare-cli/commit/675c6ad0047c93c6d4d8193fb661659ff2766c31))
- Terminal component can leak observers ([1233e37](https://github.com/project-codeflare/codeflare-cli/commit/1233e379553e377214a6f6ed2e0d92f5e1cad45b))

### Features

- bump to @guidebooks/store 0.12.0 to pick up no-ray-local breaking change ([9751cf0](https://github.com/project-codeflare/codeflare-cli/commit/9751cf0f5610e505461f7a8fd9af5cf198648f41))

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
