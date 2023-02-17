## [2.6.1](https://github.com/project-codeflare/codeflare-cli/compare/v2.6.0...v2.6.1) (2023-02-17)

### Bug Fixes

- bump @guidebooks/store@3.3.7 to pick up fix for helm chart name max length ([9330426](https://github.com/project-codeflare/codeflare-cli/commit/93304269efbdb12f6deddd122cc8509497d5d56d))

# [2.6.0](https://github.com/project-codeflare/codeflare-cli/compare/v2.5.0...v2.6.0) (2023-02-16)

### Bug Fixes

- ray self-destruct job was not cleaning up in some cases ([41dc322](https://github.com/project-codeflare/codeflare-cli/commit/41dc32269eef259ad2f324a0e5c36680d647c357))

### Features

- pick up ray self destruct from @guidebooks/store@3.3.1 ([dc0325b](https://github.com/project-codeflare/codeflare-cli/commit/dc0325b603ad5d8051388d38974e61c863a1a143))

# [2.5.0](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.6...v2.5.0) (2023-02-15)

### Features

- bump madwizard and store to pick up avoiding ray cli for job submission ([0071db9](https://github.com/project-codeflare/codeflare-cli/commit/0071db99d905a377a30799b25f5ce02725e61817))
- bump to madwizard@6 and @guidebooks/store@3 ([31420e3](https://github.com/project-codeflare/codeflare-cli/commit/31420e3cd000381499516d85aa313fb2d19d46a2))

## [2.4.6](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.5...v2.4.6) (2023-02-14)

### Bug Fixes

- bump store to pick up fix for ray service and madwizard to pick up fix for double quoted command lines ([282639a](https://github.com/project-codeflare/codeflare-cli/commit/282639a1af5b7e21d5485b7654a3bbe0bbc6aa6e))

## [2.4.5](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.4...v2.4.5) (2023-02-13)

### Bug Fixes

- pick up guidebook fixes for app label and ray v1; madwizard dashdash escape and ray-submit exception handling ([ec1a827](https://github.com/project-codeflare/codeflare-cli/commit/ec1a8271d615318ec61bd0e73615a21fc1261a46))

## [2.4.4](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.3...v2.4.4) (2023-02-10)

### Bug Fixes

- `codeflare dashboard --attach` does not clean up on ctrl+c ([13fb464](https://github.com/project-codeflare/codeflare-cli/commit/13fb4644685ea0bd27f83387064fd721eb379cb3))

## [2.4.3](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.2...v2.4.3) (2023-02-10)

### Bug Fixes

- refinements to dashboard ui, including removal of Events pane ([d02447a](https://github.com/project-codeflare/codeflare-cli/commit/d02447a200af93508f9dc432b739be7e36079030))

## [2.4.2](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.1...v2.4.2) (2023-02-10)

### Bug Fixes

- bumps to pick up improved cancel output and waiting for ray job to start ([d300e3d](https://github.com/project-codeflare/codeflare-cli/commit/d300e3d92bf639cc14e6d7432f93ab1ecd0f9b80))
- restore codeflare db -a` ([2ca946e](https://github.com/project-codeflare/codeflare-cli/commit/2ca946e5c9bc0a2cffea292d16855247e0cdd6ae))

## [2.4.1](https://github.com/project-codeflare/codeflare-cli/compare/v2.4.0...v2.4.1) (2023-02-08)

### Bug Fixes

- bump @guidebooks/store to pick up improved ray cluster name ([b782fb4](https://github.com/project-codeflare/codeflare-cli/commit/b782fb4023a8c0c4d36f0ccbf9850818c0628e69))

# [2.4.0](https://github.com/project-codeflare/codeflare-cli/compare/v2.3.4...v2.4.0) (2023-02-07)

### Features

- `codeflare profile list/edit/delete/prune/clone` commands ([7c72209](https://github.com/project-codeflare/codeflare-cli/commit/7c72209a320cce41702e7ca9838f8f1023ac4ef2))

## [2.3.4](https://github.com/project-codeflare/codeflare-cli/compare/v2.3.3...v2.3.4) (2023-02-02)

### Bug Fixes

- bump @guidebook/store@2.3.0 to pick up support for specifying ray ephemeral storage ([f9e0aa2](https://github.com/project-codeflare/codeflare-cli/commit/f9e0aa2c7d74919e1b4a2590d0d655aeb758846c))

## [2.3.3](https://github.com/project-codeflare/codeflare-cli/compare/v2.3.2...v2.3.3) (2023-02-02)

### Bug Fixes

- bump @guidebooks/store@2.2.10 to pick up s3fs mounting on ray head ([b6f3231](https://github.com/project-codeflare/codeflare-cli/commit/b6f3231b696286df366f9c993035bdc801a34fdf))
- bump madwziard@5.0.6 to pick up ctrl+c fixes ([8ae53aa](https://github.com/project-codeflare/codeflare-cli/commit/8ae53aa68406e08b89908255c84f09aa2d05dad2))
- pull back in ProfileActiveRunWatcher from kui core ([5dfb4b2](https://github.com/project-codeflare/codeflare-cli/commit/5dfb4b298aaa94a210330dcf1f7142a9f25eaac1))
- remove useless env var assignment in bin/codeflare ([e9396dd](https://github.com/project-codeflare/codeflare-cli/commit/e9396dd93e53fb03e5b1e51915213063f0a65601))

## [2.3.2](https://github.com/project-codeflare/codeflare-cli/compare/v2.3.1...v2.3.2) (2023-02-01)

### Bug Fixes

- bump to store 2.2.8 to pick up fixes for s3fs ([9bcaf91](https://github.com/project-codeflare/codeflare-cli/commit/9bcaf91e3b4ed516c997b70260c8c49e5511edca))
- do not trap ctrl+c as this prevents madwizard cleanup ([b40f345](https://github.com/project-codeflare/codeflare-cli/commit/b40f34549730233ae40b296bc14672eb2670aba0))

## [2.3.1](https://github.com/project-codeflare/codeflare-cli/compare/v2.3.0...v2.3.1) (2023-02-01)

### Bug Fixes

- update store to pick up helm chart fixes for s3fs ([5735c17](https://github.com/project-codeflare/codeflare-cli/commit/5735c175397c861434ad3eaddee219656b7f39a7))

# [2.3.0](https://github.com/project-codeflare/codeflare-cli/compare/v2.2.2...v2.3.0) (2023-01-31)

### Features

- bump to @guidebooks/store@2.2.2 s3fs storage class choice ([6d2312a](https://github.com/project-codeflare/codeflare-cli/commit/6d2312abdc967c7ac591733d444177b5b4755dd7))

## [2.2.2](https://github.com/project-codeflare/codeflare-cli/compare/v2.2.1...v2.2.2) (2023-01-18)

### Bug Fixes

- bump madwizard@4.4.0 to pick up fix for ray working-dir relative path ([a984dbd](https://github.com/project-codeflare/codeflare-cli/commit/a984dbd0ce14533f670fb169a97cb261e106569b))

## [2.2.1](https://github.com/project-codeflare/codeflare-cli/compare/v2.2.0...v2.2.1) (2023-01-17)

### Bug Fixes

- bump to madwizard@4.3.5 to pick up enquirer bump ([fdffb11](https://github.com/project-codeflare/codeflare-cli/commit/fdffb1116d954d90704b537c8838a3217604a546))

# [2.2.0](https://github.com/project-codeflare/codeflare-cli/compare/v2.1.3...v2.2.0) (2023-01-17)

### Bug Fixes

- bump @guidebooks/store@2.1.2 to pick up imagePullSecret helm parse error ([d2e71a1](https://github.com/project-codeflare/codeflare-cli/commit/d2e71a1d9172a65b61b3e5c0f4e40457e119767a))

### Features

- bump to madwizard@4.3.0 and @guidebooks/store@2.1.0 to pick up finally support ([db8f0e4](https://github.com/project-codeflare/codeflare-cli/commit/db8f0e4bf6df31983cfb5058e7d2dbdbba5d2015))

## [2.1.3](https://github.com/project-codeflare/codeflare-cli/compare/v2.1.2...v2.1.3) (2023-01-13)

### Bug Fixes

- bump to @guidebooks/store 2.0.3 to pick up helm dry-run support ([a4b81dd](https://github.com/project-codeflare/codeflare-cli/commit/a4b81dd04a72b46427d184dd0109ec4d93b04b7c))

## [2.1.2](https://github.com/project-codeflare/codeflare-cli/compare/v2.1.1...v2.1.2) (2023-01-12)

### Bug Fixes

- bump @guidebook/store 2.0.1 -> 2.0.2 ([2968293](https://github.com/project-codeflare/codeflare-cli/commit/2968293ce684b9de2ac3b7381e488df8382bd726))
- bump kui again to pick up vfs race condition fix ([86f75ad](https://github.com/project-codeflare/codeflare-cli/commit/86f75adda3615ed545fbf677920570e4cf038f70))

## [2.1.1](https://github.com/project-codeflare/codeflare-cli/compare/v2.1.0...v2.1.1) (2023-01-11)

# [2.1.0](https://github.com/project-codeflare/codeflare-cli/compare/v2.0.0...v2.1.0) (2023-01-11)

### Bug Fixes

- bump plugin-madwizard to pick up parsing bug in raw mode with madwizard ([52808fb](https://github.com/project-codeflare/codeflare-cli/commit/52808fb0cb6be2d9bff504e8cb42be4138605e8c))

### Features

- bump to electron 22 ([2b18ba8](https://github.com/project-codeflare/codeflare-cli/commit/2b18ba8478ae52d893e347613d1994e184e41c2f))

# [2.0.0](https://github.com/project-codeflare/codeflare-cli/compare/v1.5.0...v2.0.0) (2023-01-10)

### Bug Fixes

- allotment dep needs to move from plugin-codeflare to plugin-madwizard ([bcca439](https://github.com/project-codeflare/codeflare-cli/commit/bcca439dd4b2f46bed6dd2a73dad1bf5d464791b))
- bump kui to pick up fix for weird right border in title ([31d129e](https://github.com/project-codeflare/codeflare-cli/commit/31d129e6a45dd3b1ca2848b02e55dddd19969b76))
- bump madwizard 2.5.2 to pick up multiselect fix ([4d3cb9a](https://github.com/project-codeflare/codeflare-cli/commit/4d3cb9a4e23184d163b0241435e5c0391658aa94))
- fill in missing support for multiselect in <Ask/> ([aa54823](https://github.com/project-codeflare/codeflare-cli/commit/aa54823c202e0b9f7a5cd4b28e27fd1eea31c60e))
- in <Ask/> select is clipped at the bottom ([b360218](https://github.com/project-codeflare/codeflare-cli/commit/b3602188aa21cdf885f944eac6b655d81996720a))
- move additional deps from plugin-codeflare to plugin-madwizard ([8e62070](https://github.com/project-codeflare/codeflare-cli/commit/8e620703bfed12cf037f7cc50a363045ddfe545e))
- ProfileExplorer can show object Object for duplicate forms in profile ([0744a41](https://github.com/project-codeflare/codeflare-cli/commit/0744a41997b568e3c72eb1065eff406b12b59e04))

### Features

- allow WorkloadDesigner to hide ProfileExplorer ([89735ff](https://github.com/project-codeflare/codeflare-cli/commit/89735ff46a3c54afff9e361674711a98fc2cdcb3))
- major bump to kui and madwizard dependencies ([b340b33](https://github.com/project-codeflare/codeflare-cli/commit/b340b33e41ced1ca19eaeb466a7eb15a88a6ab6e))

### BREAKING CHANGES

- this pulls in react 18, which has some breaking changes on react components that this PR addresses
- this pulls in a few breaking changes to the madwizard API

bump to store 1.9.3

# [1.5.0](https://github.com/project-codeflare/codeflare-cli/compare/v1.4.1...v1.5.0) (2022-12-02)

### Features

- bump to @guidebooks/store@1.7.0 to pick up support for s3 ray storage ([1121d90](https://github.com/project-codeflare/codeflare-cli/commit/1121d902a6b17c5b49eb620e9ff12304757c88cf))

## [1.4.1](https://github.com/project-codeflare/codeflare-cli/compare/v1.4.0...v1.4.1) (2022-12-02)

### Bug Fixes

- bump to @guidebooks/store@1.6.1 to pick up no-torchx fix ([0c0d6ce](https://github.com/project-codeflare/codeflare-cli/commit/0c0d6cef4b2774a1bae284396ed142c81d76ede5))
- bump to madwizard@1.10.2 to pick up expansion fix ([812f1b2](https://github.com/project-codeflare/codeflare-cli/commit/812f1b2cff5c3ea41517081237b00532c016457f))

# [1.4.0](https://github.com/project-codeflare/codeflare-cli/compare/v1.3.2...v1.4.0) (2022-12-01)

### Features

- bump store and madwizard to pick up venv and expansion keying support ([db3a48f](https://github.com/project-codeflare/codeflare-cli/commit/db3a48f7a91545301f446297feceee2e668d0e04))

## [1.3.2](https://github.com/project-codeflare/codeflare-cli/compare/v1.3.1...v1.3.2) (2022-12-01)

### Bug Fixes

- bump to `@guidebooks/store@1.4.0` to use different ray cluster name per run ([fdbb900](https://github.com/project-codeflare/codeflare-cli/commit/fdbb900e57b0aa5100f78e8fd5da29b536517399))

## [1.3.1](https://github.com/project-codeflare/codeflare-cli/compare/v1.3.0...v1.3.1) (2022-11-30)

### Bug Fixes

- regression in user updates to form inputs ([75e1ec8](https://github.com/project-codeflare/codeflare-cli/commit/75e1ec817efa86ae645a7d77d1dbdd9082254683))
- second of back-to-back forms does not work ([3b9a4d3](https://github.com/project-codeflare/codeflare-cli/commit/3b9a4d3bdd92d425d94f1615247a07e3eb55bfe9))

# [1.3.0](https://github.com/project-codeflare/codeflare-cli/compare/v1.2.0...v1.3.0) (2022-11-30)

### Features

- bump to `@guidebooks/store@1.3.0` to pick to ibm cloud codeengine support ([962affe](https://github.com/project-codeflare/codeflare-cli/commit/962affe97b689b3341bbb5153d3e28a06a0a69b8))

# [1.2.0](https://github.com/project-codeflare/codeflare-cli/compare/v1.1.0...v1.2.0) (2022-11-29)

### Bug Fixes

- bump to `@guidebooks/store@1.2.3` to pick up description changes for roberta ([ea1da00](https://github.com/project-codeflare/codeflare-cli/commit/ea1da00a602cfd9f27df011966e48d43ebd7a9aa))

### Features

- disable status watching in tray menu ([73664b3](https://github.com/project-codeflare/codeflare-cli/commit/73664b39632636593d98d4734062e8623525f345))

# [1.1.0](https://github.com/project-codeflare/codeflare-cli/compare/v1.0.3...v1.1.0) (2022-11-29)

### Bug Fixes

- add missing descriptions to form elements in Ask component ([7274152](https://github.com/project-codeflare/codeflare-cli/commit/72741524da886b05f79a6d0d65256b62cd6d3a78))
- adjust default window size to 1152x864 (from 1400x1050) ([5bf3463](https://github.com/project-codeflare/codeflare-cli/commit/5bf3463567dc142d8a2a89b0b27fe6acc10ed581))
- adjust font-weight in Ask titles to match those in ProfileExplorer (500) ([b6051d1](https://github.com/project-codeflare/codeflare-cli/commit/b6051d1e63befc642297dea4f958274a8d0b7a05))
- another bump for store to re-pick up description fixes ([809f30f](https://github.com/project-codeflare/codeflare-cli/commit/809f30f56b6c35e3c8c765e034378a513c1b6a93))
- Ask component body does not vertically scroll on overflow ([5b5bb1e](https://github.com/project-codeflare/codeflare-cli/commit/5b5bb1e5718a574c56924b55bdb04f8b4a1bd6a9))
- Ask component does not handle form updates ([100b6d9](https://github.com/project-codeflare/codeflare-cli/commit/100b6d9628dfefc6b43e8909b99ec8f20a864014))
- Ask component's Home button causes header height unconformity vs ProfileExplorer ([fdf9b5e](https://github.com/project-codeflare/codeflare-cli/commit/fdf9b5eaee284880437f9be1494cead92c4248f5))
- ask user to confirm profile reset and delete ([767cc08](https://github.com/project-codeflare/codeflare-cli/commit/767cc089274d2e1b311dec4702a2f439d1490931))
- avoid key warning from react in Ask component ([f327967](https://github.com/project-codeflare/codeflare-cli/commit/f327967efebdabbaff37f69a4c4cd320355b23ba))
- bump kui to pick up fix for markdown terminal links ([5dabe8c](https://github.com/project-codeflare/codeflare-cli/commit/5dabe8c896331940102d26dac65562eb1bd12a94))
- bump kui to pick up fix for multi-link markdown ([e8be7dd](https://github.com/project-codeflare/codeflare-cli/commit/e8be7dd7048a90b988afbae710fe500965dc79b9))
- bump madwizard and store to pick up nested import description fixes ([4a47c06](https://github.com/project-codeflare/codeflare-cli/commit/4a47c0611f1105b83df33f66f88ad4d22302f23c))
- bump roberta self-test to 1.0.3 ([209f8bf](https://github.com/project-codeflare/codeflare-cli/commit/209f8bfab37c45fbba524e23b45ff3c859eda22f))
- bump store to pick up byoc description updates ([6b5dc91](https://github.com/project-codeflare/codeflare-cli/commit/6b5dc9143d889ad845514288a69bd8ef276edb5f))
- bump to `@guidebooks/store@1.1.1` to pick to roberta ray v1 fix ([04b72a8](https://github.com/project-codeflare/codeflare-cli/commit/04b72a86ed4a1d1bac61d10047ae3a9e67154dde))
- bump to `@guidebooks/store@1.2.2` to pick up roberta base image fixes ([2959090](https://github.com/project-codeflare/codeflare-cli/commit/295909030694db9b4467dd533080f5ed7cdbba98))
- bump to madwizard@1.9.1 to pick up a RAY_ADDRESS fix ([1b3d0e8](https://github.com/project-codeflare/codeflare-cli/commit/1b3d0e8139910c9c1bfd3d632dcd418b52678c5c))
- do not use font-weight: 500 for "simplistic" selects, those with no item descriptions ([dc2c137](https://github.com/project-codeflare/codeflare-cli/commit/dc2c13799355bdcd03a0073450092a7609ce74bc))
- group all ProfileExplorer action buttons, don't float new to the left ([c1d2d00](https://github.com/project-codeflare/codeflare-cli/commit/c1d2d00481bf656ca85986aa20fe074bc5c4472a))
- multiple fixes for excessive cpu consumption ([b092604](https://github.com/project-codeflare/codeflare-cli/commit/b092604668075394043fe5af4da7e0f9f5ebbf75))
- ProfileExplorer chips blue->purple ([cf0a55c](https://github.com/project-codeflare/codeflare-cli/commit/cf0a55c4e5b7673e91b73687b7616524283e6ced))
- ProfileExplorer has extra spacing to the right of New button ([5e603fd](https://github.com/project-codeflare/codeflare-cli/commit/5e603fd33047cc5e38d4b90ccd94fd519ad4d3f6))
- ProfileExplorer should only show edit buttons when in an editable/unlocked mode ([f99f56d](https://github.com/project-codeflare/codeflare-cli/commit/f99f56db87a17acc4e396b9e8309eea7fdb8e7c2))
- reduce default height of terminal portion ([33bd3da](https://github.com/project-codeflare/codeflare-cli/commit/33bd3daa44309052e19b930bf7442f84a7f227d0))
- refine <Ask/> component to use a fixed title, and instead put guidebook title below ([ab23956](https://github.com/project-codeflare/codeflare-cli/commit/ab239565d18377b28f1d66ff832dfd6ce13ea68d))
- refine some of the major groupings in ProfileExploer ([4adf94b](https://github.com/project-codeflare/codeflare-cli/commit/4adf94b45e0827ed9e6b7fec61983fd1e4357153))
- simplify hello guidebook to remove top-level markdown tabs ([2616ac2](https://github.com/project-codeflare/codeflare-cli/commit/2616ac24f3abf59d0854b54b8a461fee572eb858))
- switch from Tile UI to Select UI for <Ask/> ([95bcc47](https://github.com/project-codeflare/codeflare-cli/commit/95bcc47ad8d23c9d3a18a20e05ec4551d444bc3b))
- switch to control buttons in ProfileExplorer ([91512d1](https://github.com/project-codeflare/codeflare-cli/commit/91512d1089a3436324834833acc2732b04c16abf))
- terminal resets interactive-for state too aggressively ([d6f1b84](https://github.com/project-codeflare/codeflare-cli/commit/d6f1b84126d439c1e33245aefef172d1448f9b0d))
- ui refinements to ProfileExplorer and Ask ([e737969](https://github.com/project-codeflare/codeflare-cli/commit/e7379696423d7cd6c7206c8205c4cf8d5f690e6e))
- update madwizard to not show guidebook title in terminal section ([c133c93](https://github.com/project-codeflare/codeflare-cli/commit/c133c930395a72ffa8eee77755b8fcd393c2487e))
- update test profiles to increase head memory for non-gpu runs ([72ad409](https://github.com/project-codeflare/codeflare-cli/commit/72ad409258b731161887e17c7a1ee7993250f330))

### Features

- bump to @guidebooks/store@0.18.0 to pick up ray auto-stop ([e3b641e](https://github.com/project-codeflare/codeflare-cli/commit/e3b641e342081a6f1bae1b4b5280b84c4ac5a11a))
- bump to `@guidebooks/store@1.1.0` to pick up ray/v1 support and bert updates ([b942761](https://github.com/project-codeflare/codeflare-cli/commit/b94276134475564b7441dc2a735d5ef095a412f9))
- graphical guide ([48187fe](https://github.com/project-codeflare/codeflare-cli/commit/48187fec6c94cc3be7783b84fe95e28b0dcb411b))
- incorporate madwizard@1.8.0 support for Choice descriptions into <Ask/> ([8036b28](https://github.com/project-codeflare/codeflare-cli/commit/8036b2888ad7ad1d35a35bbe9c8a036d4175d537))
- update `codeflare hello` to pass through `-s` guidebook store option ([617be01](https://github.com/project-codeflare/codeflare-cli/commit/617be013112988b3fab37e59a0e9290dca10c937))

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
