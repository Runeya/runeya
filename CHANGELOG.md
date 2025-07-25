# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.33.34](https://github.com/runeya/runeya/compare/v1.33.33...v1.33.34) (2025-07-10)

### Bug Fixes

* **editors:** add support for windsurf ([9a6f5de](https://github.com/runeya/runeya/commit/9a6f5deda8f14b5b5e838c1bd8a9a618fddd96b2))

## [1.33.33](https://github.com/runeya/runeya/compare/v1.33.32...v1.33.33) (2025-07-07)

### Bug Fixes

* **logs:** can execute command on host when docker is configured ([9a4295b](https://github.com/runeya/runeya/commit/9a4295baf55f35adc6c3496e176ffa3869a9ca84))
* **logs:** change color of json to yellow ([a1215b5](https://github.com/runeya/runeya/commit/a1215b5c8c6fbe66aa5178077f0feca3bd7a71ab))
* **logs:** refactor all logs ([f559d16](https://github.com/runeya/runeya/commit/f559d1612ba8e545e442f79d14474872b90d1db7))
* **logs:** z-index on scroll-pause-indicator to allow tippyjs to be on top of it ([368623f](https://github.com/runeya/runeya/commit/368623fe16df1bd925908240a1c263f4d60494f8))

## [1.33.32](https://github.com/runeya/runeya/compare/v1.33.31...v1.33.32) (2025-06-16)

### Bug Fixes

* **server:** dont load an empty labelled service ([010ffec](https://github.com/runeya/runeya/commit/010ffec7a95cc220cdaafe8801fa959c331afe2a))

## [1.33.31](https://github.com/runeya/runeya/compare/v1.33.30...v1.33.31) (2025-06-16)

### Bug Fixes

* **server:** remove a debug log ([f689d17](https://github.com/runeya/runeya/commit/f689d175bf63da0114d178d3af7400cd2aec1284))

## [1.33.30](https://github.com/runeya/runeya/compare/v1.33.29...v1.33.30) (2025-06-16)

### Bug Fixes

* **environment:** migrate in all case to prevent inconsistency between overrides in database and loaded ([4b1a297](https://github.com/runeya/runeya/commit/4b1a297817db6041e0875319d10786a81ff11d2a))

## [1.33.29](https://github.com/runeya/runeya/compare/v1.33.28...v1.33.29) (2025-06-16)

### Bug Fixes

* **logs:** default to 200 ([deb584b](https://github.com/runeya/runeya/commit/deb584be8f8d1d2586ba3b97c0661f252affacb2))

## [1.33.28](https://github.com/runeya/runeya/compare/v1.33.27...v1.33.28) (2025-06-16)

### Bug Fixes

* **environments:** migrate overrides from stackmonitor ([6f3be1d](https://github.com/runeya/runeya/commit/6f3be1dd7b6b900c9e355a8185ee0a18776892e5))

## [1.33.27](https://github.com/runeya/runeya/compare/v1.33.26...v1.33.27) (2025-06-15)

### Bug Fixes

* **app:** make async components to load correctly in gui ([d4f2999](https://github.com/runeya/runeya/commit/d4f29997014f40d674b5ac353f1820c77b23019c))

## [1.33.26](https://github.com/runeya/runeya/compare/v1.33.25...v1.33.26) (2025-06-11)

### Bug Fixes

* **plugin:** remove console.log ([b20a2f0](https://github.com/runeya/runeya/commit/b20a2f08f3b9cc6476338109b13df7eb6a094230))

## [1.33.25](https://github.com/runeya/runeya/compare/v1.33.24...v1.33.25) (2025-06-11)

### Bug Fixes

* **plugin:** add an global availability ([c2fca92](https://github.com/runeya/runeya/commit/c2fca928f1d526624674dc81c953be5752c92891))
* **plugin:** reinstall plugin on start if global or not found on disk ([51c4d81](https://github.com/runeya/runeya/commit/51c4d81ffc03f42ccb5d28a84ecb576f6993e221))

## [1.33.24](https://github.com/runeya/runeya/compare/v1.33.23...v1.33.24) (2025-06-09)

### Bug Fixes

* **environments:** improve colors on environment variables tab ([8cd8df9](https://github.com/runeya/runeya/commit/8cd8df9fd5b8f051bb9ad1a939c2c40b7aaf103e))

## [1.33.23](https://github.com/runeya/runeya/compare/v1.33.22...v1.33.23) (2025-06-09)

### Bug Fixes

* **plugins:** write correct .gitignore file for plugins ([4771d82](https://github.com/runeya/runeya/commit/4771d82f0509a0f6e65f94c85704f8a3e063d2bd))
* **server:** factorize creation of default files ([34824df](https://github.com/runeya/runeya/commit/34824df5d4b706ff7eb6123d4eb9aaf171f0f14e))

## [1.33.22](https://github.com/runeya/runeya/compare/v1.33.21...v1.33.22) (2025-06-09)

### Bug Fixes

* **app:** change some breakpoint in ui ([d9690df](https://github.com/runeya/runeya/commit/d9690dff11ae8518b22525c27d69d653beb0f54d))
* **documentation:** fix documentation not loading + cosmetic changes on documentation sidebar ([e76d932](https://github.com/runeya/runeya/commit/e76d93218c01293d3d13ca21574515b4a374c86a))
* **Editor:** set correct theme ([bdcda9a](https://github.com/runeya/runeya/commit/bdcda9a94b466ba94471aff7b4aa282c9af26b1f))
* **environments variable:** restart only on modal close ([ab0916a](https://github.com/runeya/runeya/commit/ab0916a608e7921543d3684e5df6f028eabb5caa))
* **finder+logs:** change some css variable to match with selected theme ([3f219f0](https://github.com/runeya/runeya/commit/3f219f0318e2995e83ba341dd41daf618a9f3e53))
* **finder:** open up everywhere ([ae25f0f](https://github.com/runeya/runeya/commit/ae25f0ff1feba68d0f046471985f836688db4b56))
* **openai:** remove from sidebar ([51115c2](https://github.com/runeya/runeya/commit/51115c27f239649083ff2b6d658b3038a4393795))
* **server:** fix problems on migration from stackmonitor resulting on subfolder copy, no encryptionkey and no overrides ([23ea8bc](https://github.com/runeya/runeya/commit/23ea8bc219d3d4500aeb5231a59626ec898d4f34))
* **theme:** change sidebarmain item color ([01cc010](https://github.com/runeya/runeya/commit/01cc01006e22d7fcbe9c7a044e139a273a5b6389))

## [1.33.21](https://github.com/runeya/runeya/compare/v1.33.20...v1.33.21) (2025-06-09)

### Bug Fixes

* **vscode:** add missing dependencies ([d7fd7fb](https://github.com/runeya/runeya/commit/d7fd7fba5bdcd1b62f9f741e5e4702399d459b05))

## [1.33.20](https://github.com/runeya/runeya/compare/v1.33.19...v1.33.20) (2025-06-09)

### Bug Fixes

* some fix for dev watcher ([99ebd82](https://github.com/runeya/runeya/commit/99ebd82e1383caed7927dd227514968744750a4e))
* **vscode:** externalize vscode plugin ([6dfcccc](https://github.com/runeya/runeya/commit/6dfcccc046a42e153c2348bee0a5d207e75e3c3a))

## [1.33.19](https://github.com/runeya/runeya/compare/v1.33.18...v1.33.19) (2025-06-08)

### Bug Fixes

* various bugfix on assets loading in production ([7a6e79e](https://github.com/runeya/runeya/commit/7a6e79e3202a4d51b2164af9b4144b392bc13457))

## [1.33.18](https://github.com/runeya/runeya/compare/v1.33.17...v1.33.18) (2025-06-08)

### Bug Fixes

* **plugins:** use config tsup instead to compile it ([9c225bb](https://github.com/runeya/runeya/commit/9c225bb2d50542a32f29a6526b51a40cf223db33))

## [1.33.17](https://github.com/runeya/runeya/compare/v1.33.16...v1.33.17) (2025-06-08)

### Bug Fixes

* **app:** some modules hasnt front file ([91ce2d4](https://github.com/runeya/runeya/commit/91ce2d4b56e0ae5bb5696197e1b6e6e81289c635))
* **server:** authorize some frames origin ([d3158ac](https://github.com/runeya/runeya/commit/d3158ac4918056b21f5248d000bdad5b879fbe39))

## [1.33.16](https://github.com/runeya/runeya/compare/v1.33.15...v1.33.16) (2025-06-08)

### Bug Fixes

* missing dependency in production ([61d9bbf](https://github.com/runeya/runeya/commit/61d9bbfeda0563ef11648898c03312cb2f0b95bb))

## [1.33.15](https://github.com/runeya/runeya/compare/v1.33.14...v1.33.15) (2025-06-08)

**Note:** Version bump only for package @runeya/runeya

## [1.33.14](https://github.com/runeya/runeya/compare/v1.33.13...v1.33.14) (2025-06-08)

**Note:** Version bump only for package @runeya/runeya

## [1.33.13](https://github.com/runeya/runeya/compare/v1.33.12...v1.33.13) (2025-06-08)

**Note:** Version bump only for package @runeya/runeya

## [1.33.12](https://github.com/runeya/runeya/compare/v1.33.11...v1.33.12) (2025-06-08)

**Note:** Version bump only for package @runeya/runeya

## [1.33.11](https://github.com/runeya/runeya/compare/v1.33.10...v1.33.11) (2025-06-07)

### Bug Fixes

* **plugins:** remove upload artefacts ([4f8fa90](https://github.com/runeya/runeya/commit/4f8fa903bac8be08d64d2b0cbdd745645bb3f3a3))

## [1.33.10](https://github.com/runeya/runeya/compare/v1.33.9...v1.33.10) (2025-06-07)

**Note:** Version bump only for package @runeya/runeya

## [1.33.9](https://github.com/runeya/runeya/compare/v1.33.8...v1.33.9) (2025-06-07)

### Bug Fixes

* **plugins:** can install additionnal production dependencies ([5acd536](https://github.com/runeya/runeya/commit/5acd53627f00a735dd19752a8c56046efdb46fb9))
* **plugins:** simplified publish scripts ([c3597b4](https://github.com/runeya/runeya/commit/c3597b4ea49f63c08e491dda4b4a73a476f2ba8c))

## [1.33.8](https://github.com/runeya/runeya/compare/v1.33.7...v1.33.8) (2025-06-07)

### Bug Fixes

* **plugins:** retrigger app ([efb995b](https://github.com/runeya/runeya/commit/efb995b052b543be6444e57e037cd36ed2c135ee))
* **plugins:** retrigger app ([0059da3](https://github.com/runeya/runeya/commit/0059da31e8e6ec8ff28fe469c9f821c2e6f67926))
* **plugins:** retrigger app ([1d2ed71](https://github.com/runeya/runeya/commit/1d2ed71e701fec0fa7575347df02f9ea59739637))

## [1.33.7](https://github.com/runeya/runeya/compare/v1.33.6...v1.33.7) (2025-06-07)

### Bug Fixes

* **plugins:** add ci stuff ([ae2216a](https://github.com/runeya/runeya/commit/ae2216a23b29d0351cdad8c73a3a6bb5747266c9))

## [1.33.6](https://github.com/runeya/runeya/compare/v1.33.5...v1.33.6) (2025-06-07)

### Bug Fixes

* **plugins:** add github ci stuff to deploy plugins ([3efe08d](https://github.com/runeya/runeya/commit/3efe08dbdba55eed8548c7ba8c4a01055dd917ae))

## [1.33.5](https://github.com/runeya/runeya/compare/v1.33.4...v1.33.5) (2025-06-07)

### Bug Fixes

* **auth:** redirect uri controlled by env ([2f09730](https://github.com/runeya/runeya/commit/2f09730aaf80b06566294efcd9758cdd15656677))

## [1.33.4](https://github.com/runeya/runeya/compare/v1.33.3...v1.33.4) (2025-06-07)

### Bug Fixes

* **mongo:** connect directly to connectionString host on other parts ([6192401](https://github.com/runeya/runeya/commit/6192401eb0e3cdad883c67c8a71dd815138561c7))

## [1.33.3](https://github.com/runeya/runeya/compare/v1.33.2...v1.33.3) (2025-06-07)

### Bug Fixes

* **mongo:** connect directly to connectionString host ([fe4d606](https://github.com/runeya/runeya/commit/fe4d60659e9f98a39ad057f50ef01338ab43ef95))

## [1.33.2](https://github.com/runeya/runeya/compare/v1.33.1...v1.33.2) (2025-06-07)

### Bug Fixes

* **landing:** add correct dist entry ([8901edc](https://github.com/runeya/runeya/commit/8901edc5e2daa20eea0fb956a7818e4bcb60b948))

## [1.33.1](https://github.com/runeya/runeya/compare/v1.0.16...v1.33.1) (2025-06-06)

### Bug Fixes

* **landing:** deploy server ([99b7e0e](https://github.com/runeya/runeya/commit/99b7e0e08adc7f50db9b9ed16644ca3335b96a32))

## [1.0.16](https://github.com/runeya/runeya/compare/v1.0.15...v1.0.16) (2025-06-06)

### Bug Fixes

* remove unecessary tsconfig ([da528cb](https://github.com/runeya/runeya/commit/da528cbdf4625e7b0ed10364a1d68002c3e7c4eb))

## [1.0.15](https://github.com/runeya/runeya/compare/v1.0.14...v1.0.15) (2025-06-06)

### Bug Fixes

* add missing axios dependency ([cf5323a](https://github.com/runeya/runeya/commit/cf5323a6a5cacbc8cc1fb32c582938f0dd5988dd))

## [1.0.14](https://github.com/runeya/runeya/compare/v1.0.13...v1.0.14) (2025-06-06)

### Bug Fixes

* add landing app ([fe66c3f](https://github.com/runeya/runeya/commit/fe66c3f783322cc574a2872967e3314090747f61))
* add plugin upload route ([36997c8](https://github.com/runeya/runeya/commit/36997c8cb140432ead61f4df61801ad0e566dd9c))
* **dev:** point runeya used to dev to latest published tag ([67f06b3](https://github.com/runeya/runeya/commit/67f06b3531a57711a13a6de3a127b45ce93d2e37))
* **express:** support betterauth injection ([562be8d](https://github.com/runeya/runeya/commit/562be8d7d3376775f5823a21e4ff7a3a6286120d))
* **front:** can resize service sidebar on single service view ([262af44](https://github.com/runeya/runeya/commit/262af4497647110e0a4ce50ceb1952d6d3ef4732))
* **front:** rework add service button ([db7bb15](https://github.com/runeya/runeya/commit/db7bb15a36a45558e322331b31885dc18b4433e4))
* **fronts-app:** prepare support for webelements integration ([bd952bc](https://github.com/runeya/runeya/commit/bd952bc214a4e161ebd7a915d8f78ca9ba19552d))
* **landing:** can view and download plugins ([c85af9f](https://github.com/runeya/runeya/commit/c85af9f78daa37f7cef4fbfcf13d1296e58eeccc))
* make themes ([846b370](https://github.com/runeya/runeya/commit/846b370a23102eb726e9172768b9b6839bce3537))
* **mongo:** add common mongo to connect to mongo inside monorepo ([ce14f63](https://github.com/runeya/runeya/commit/ce14f63aebc3f523cca79c7c4d8e1375f9e1b269))
* **plugin:** migrate all toolbox plugins ([75de7e8](https://github.com/runeya/runeya/commit/75de7e82483ba022199b91f6c84da608f2889f13))
* **server:** update config ([107c486](https://github.com/runeya/runeya/commit/107c48618f3395c6e64ca8ca8d8700fa81673207))
* **themes:** add new themes ([a9b6915](https://github.com/runeya/runeya/commit/a9b69158fc3f44ee2dfcddb4fd706ebba4f650a6))
* update yarn ([c93ca47](https://github.com/runeya/runeya/commit/c93ca47e0a1525978ae3543478aea32417ba90ce))
* wip ([5137049](https://github.com/runeya/runeya/commit/5137049e4de89d65551a9408c46fae5ed0ef3d6c))

## [1.0.13](https://github.com/runeya/runeya/compare/v1.0.12...v1.0.13) (2025-05-15)

### Bug Fixes

* **lanfding:** change icons ([7d1175f](https://github.com/runeya/runeya/commit/7d1175fbeaf335dee55dcb35e79c29a63542b991))

## [1.0.12](https://github.com/runeya/runeya/compare/v1.0.11...v1.0.12) (2025-05-15)

### Bug Fixes

* **landing:** change color for logo text ([0ac8c87](https://github.com/runeya/runeya/commit/0ac8c87680ba2e0bd51630e5a97bf0c723d64a9b))

## [1.0.11](https://github.com/runeya/runeya/compare/v1.0.10...v1.0.11) (2025-05-15)

### Bug Fixes

* **landing:** update preview ([73eef56](https://github.com/runeya/runeya/commit/73eef5674380eb066877a7ce477894263a51355c))

## [1.0.10](https://github.com/runeya/runeya/compare/v1.0.9...v1.0.10) (2025-05-15)

### Bug Fixes

* **docker:** publish docker images on docker repository ([712902b](https://github.com/runeya/runeya/commit/712902b00906c2f746b8fbf4012a69e095fe9895))

## [1.0.9](https://github.com/runeya/runeya/compare/v1.0.8...v1.0.9) (2025-05-15)

### Bug Fixes

* **docker:** optionnal yarn cache copy ([b010822](https://github.com/runeya/runeya/commit/b010822d9af98b03a9f8c8f12efc0b2637002314))
* **docker:** reenable other ci stuff ([ffbae05](https://github.com/runeya/runeya/commit/ffbae05c8fed6a5b3b282c1b124648016b346efc))
* try to authenticate docker ([f63e739](https://github.com/runeya/runeya/commit/f63e7397f0c0b8095fee66a5c656f486003e1659))

## [1.0.8](https://github.com/runeya/runeya/compare/v1.0.7...v1.0.8) (2025-05-15)

### Bug Fixes

* **ci:** retrigger build ([0449c2d](https://github.com/runeya/runeya/commit/0449c2dc6fa84c8cd0fc2cb0e7b6ad8ba24fde0c))

## [1.0.7](https://github.com/runeya/runeya/compare/v1.0.6...v1.0.7) (2025-05-15)

### Bug Fixes

* **ci:** retrigger build ([0ba5fcc](https://github.com/runeya/runeya/commit/0ba5fccb924e1728d125c2f3abb4065ba7404888))

## [1.0.6](https://github.com/runeya/runeya/compare/v1.0.5...v1.0.6) (2025-05-15)

### Bug Fixes

* **ci:** retrigger build ([56c7bcb](https://github.com/runeya/runeya/commit/56c7bcb6adcc5460e6c35abf939e5759047b5c92))

## [1.0.5](https://github.com/runeya/runeya/compare/v1.0.4...v1.0.5) (2025-05-15)

### Bug Fixes

* **ci:** connect to docker hub registry ([a2373ab](https://github.com/runeya/runeya/commit/a2373abecbc9ea1f7262af1fe44972f5b3c05673))

## [1.0.4](https://github.com/runeya/runeya/compare/v1.0.3...v1.0.4) (2025-05-15)

### Bug Fixes

* change authors to runeya ([1156054](https://github.com/runeya/runeya/commit/11560542b6c6856d56cf7c3a6493fe1e294b55ff))
* remove deploy on github page ([befe678](https://github.com/runeya/runeya/commit/befe678a380db593169ba050729f355bb069b474))
* various changes ([dbdd6ff](https://github.com/runeya/runeya/commit/dbdd6ff592b1c34418fe2e2b87711701c6ae2bcb))

## [1.0.3](https://github.com/runeya/runeya/compare/v1.0.2...v1.0.3) (2025-05-14)

### Bug Fixes

* **docs+landing:** add landing site + update doc ([0cb424e](https://github.com/runeya/runeya/commit/0cb424e3cc70b341624e9ec9c31d6a5ed9d23085))
* **landing:** add docker ci ([e6a61df](https://github.com/runeya/runeya/commit/e6a61df6a611fa349988751f8de028902b98a765))
* **landing:** herits from retrigger all build ([51eda5f](https://github.com/runeya/runeya/commit/51eda5f1c95f47bf03bae820152d4c55adc38116))

## [1.0.2](https://github.com/runeya/runeya/compare/v1.0.1...v1.0.2) (2025-05-13)

### Bug Fixes

* add permission to write ([a38a60e](https://github.com/runeya/runeya/commit/a38a60ec773ba4ed0e3388dddd4c96a12ffe0da2))
* add permission to write ([31f4192](https://github.com/runeya/runeya/commit/31f41924cc67deead526053ba33c33f55a933f78))
* retrigger all build ([29b2851](https://github.com/runeya/runeya/commit/29b285173f57474b3e146c8708766bc704865489))

## [2.2.1](https://github.com/clabroche/stack-monitor/compare/v2.2.0...v2.2.1) (2025-04-02)

**Note:** Version bump only for package @clabroche/stack-monitor

# [2.2.0](https://github.com/clabroche/stack-monitor/compare/v2.1.5...v2.2.0) (2025-04-01)

### Bug Fixes

* **httprequest:** add to toolbox ([005693c](https://github.com/clabroche/stack-monitor/commit/005693cb7493df14561f309cdaeb2df51eeec4b4))
* **json-formatter:** fix height of editor ([f12bd07](https://github.com/clabroche/stack-monitor/commit/f12bd07f7dda643b238d7188fc6ef73fd91a7733))
* **package:** update test script in package.json files to remove exit code ([b6fded2](https://github.com/clabroche/stack-monitor/commit/b6fded2acf6130a992e461c43c61dd44b3fbbbb8))
* **service:** refont all settings ([b266912](https://github.com/clabroche/stack-monitor/commit/b266912ec38be80e531866e46b4401337557f186))
* **stack:** update package.json ([9cda995](https://github.com/clabroche/stack-monitor/commit/9cda9955878501659bb9e70c539dae0494b00b30))
* **yarn:** update yarn.lock ([5d24e89](https://github.com/clabroche/stack-monitor/commit/5d24e89192508f716ca4fae99d62e5db8dd3813f))

### Features

* **base64:** add Base64 encoding/decoding module with frontend and backend support ([035aed5](https://github.com/clabroche/stack-monitor/commit/035aed5ae0a598ba81a32339ed04f4b1061637fb))
* **environment:** add support for environment overrides and extract tags for service configurations ([0c2c58c](https://github.com/clabroche/stack-monitor/commit/0c2c58c8ee45c40c785f88a51fe220ae6227d36b))
* **json-formatter:** enhance JSON Formatter module with new features and improved UI ([fe6455a](https://github.com/clabroche/stack-monitor/commit/fe6455a213ca0690100877dc76ea6658ef0cbc4e))
* **jwt:** implement JWT toolkit with decoding, verification, generation, and analysis features ([5467a6d](https://github.com/clabroche/stack-monitor/commit/5467a6dd4dfa3fd1ba8270187ffcc9a952ac7ba4))
* **mongo:** enhance MongoDB toolkit with new features and improved UI ([2cb8a0a](https://github.com/clabroche/stack-monitor/commit/2cb8a0ae21e1fde8db341df63b312377ce4960da))
* **node-repl:** refactor REPL backend and frontend with enhanced features ([243f769](https://github.com/clabroche/stack-monitor/commit/243f769f5ef80ee1de8c7a6febfc4cff558c2eaf))
* **readme:** add initial README.md with project overview, features, installation instructions, and contribution guidelines ([639148e](https://github.com/clabroche/stack-monitor/commit/639148ea34d2c3b696af7ea959295b969889c6c8))
* **sql-beautifier:** add SQL beautifier module for formatting SQL queries ([e4b4e2d](https://github.com/clabroche/stack-monitor/commit/e4b4e2dd332cfa120c70e382b799d81f655e24ff))
* **uuid:** enhance UUID generation with customizable options and add CopyButton component ([eb4b19d](https://github.com/clabroche/stack-monitor/commit/eb4b19d7a7cbf3da0f75cdda4d73d365cdbe6fc5))

## [2.1.5](https://github.com/clabroche/stack-monitor/compare/v2.1.4...v2.1.5) (2025-03-21)

### Bug Fixes

* **nodered:** debug run command ([5eff16e](https://github.com/clabroche/stack-monitor/commit/5eff16e95ef4578eb71abe3ee45e26dc9d4c2c4f))

## [2.1.4](https://github.com/clabroche/stack-monitor/compare/v2.1.3...v2.1.4) (2025-03-16)

### Bug Fixes

* **nodered:** add possibility to launch single command or shortcut ([a9f5d09](https://github.com/clabroche/stack-monitor/commit/a9f5d094098c08a04278464013b0eb3956c460e9))

## [2.1.3](https://github.com/clabroche/stack-monitor/compare/v2.1.2...v2.1.3) (2025-03-05)

### Bug Fixes

* can pull env from cli ([4ca6d49](https://github.com/clabroche/stack-monitor/commit/4ca6d49aaa7d05c36e4349b4aac2e26100df2b54))
* uuid vanilla for nodered ([20ec123](https://github.com/clabroche/stack-monitor/commit/20ec1232a9db39f024c8db3159123bd2266aa915))

## [2.1.2](https://github.com/clabroche/stack-monitor/compare/v2.1.1...v2.1.2) (2025-03-05)

### Bug Fixes

* **docs:** update actions ([ad568b0](https://github.com/clabroche/stack-monitor/commit/ad568b04e4227aa5714ef1093428fc3972be77ec))
* increase action versions ([2c5c66c](https://github.com/clabroche/stack-monitor/commit/2c5c66c474c499f8c92a1707bb30336037d85119))
* set needed fields on nodered packagejson when missing ([8e6bdce](https://github.com/clabroche/stack-monitor/commit/8e6bdcef674023ed560d631fa2d0dc5f1cb16cfd))

## [2.1.1](https://github.com/clabroche/stack-monitor/compare/v2.1.0...v2.1.1) (2025-02-11)

### Bug Fixes

* improve code health ([865b996](https://github.com/clabroche/stack-monitor/commit/865b996fa0adcf49668fa770c465bac1f1d8f21a))
* **nodered:** respect git versionning ([0965d44](https://github.com/clabroche/stack-monitor/commit/0965d445f6ad3ff9165cb8b3c3397958229ff7a8))

# [2.1.0](https://github.com/clabroche/stack-monitor/compare/v2.0.17...v2.1.0) (2025-01-31)

### Features

* **nodered:** add nodered into app ([f897eb2](https://github.com/clabroche/stack-monitor/commit/f897eb2c4a9128e0d4615f6765d3ef0ce1d2ca3e))

## [2.0.17](https://github.com/clabroche/stack-monitor/compare/v2.0.16...v2.0.17) (2025-01-24)

### Bug Fixes

* **Logs:** fix arrow height for terminal bar ([eaa2dc3](https://github.com/clabroche/stack-monitor/commit/eaa2dc3f4333040dfb23dc04221bec1735f1ca3f))

## [2.0.16](https://github.com/clabroche/stack-monitor/compare/v2.0.15...v2.0.16) (2025-01-24)

### Bug Fixes

* **Npm:** priority to commands over rootpath ([460df64](https://github.com/clabroche/stack-monitor/commit/460df64d4ed66056ae26c213b8f83e5fe932d980))

## [2.0.15](https://github.com/clabroche/stack-monitor/compare/v2.0.14...v2.0.15) (2025-01-24)

### Bug Fixes

* **Bugs:** support for new command selector ([afd2815](https://github.com/clabroche/stack-monitor/commit/afd2815b8c7cf3dd01e5f9408174000e8913996b))
* **Npm:** support for new command selector ([edfbb76](https://github.com/clabroche/stack-monitor/commit/edfbb76cfddec911a210f5be9554e497c60f92fb))

## [2.0.14](https://github.com/clabroche/stack-monitor/compare/v2.0.13...v2.0.14) (2025-01-24)

### Bug Fixes

* **Log:** fix color css to view the cwd path ([8e38a36](https://github.com/clabroche/stack-monitor/commit/8e38a36394c1332c9607696fb659a0e3cf8247a3))

## [2.0.13](https://github.com/clabroche/stack-monitor/compare/v2.0.12...v2.0.13) (2025-01-24)

### Bug Fixes

* **services:** dont guess anymore cwd from the first command ([e62077f](https://github.com/clabroche/stack-monitor/commit/e62077f377c11553fcae6dfd19dbffe989342551))

## [2.0.12](https://github.com/clabroche/stack-monitor/compare/v2.0.11...v2.0.12) (2025-01-24)

### Bug Fixes

* **editor:** disable for stackmultiple ([ae4735f](https://github.com/clabroche/stack-monitor/commit/ae4735f27d3a443da4eedf11d6688ce8e9b6bc79))
* **editor:** fix a reactive problem ([b292771](https://github.com/clabroche/stack-monitor/commit/b292771896ea9c37bcf03f4bbf0fd53d6819c718))
* **editors:** can choose an editor by services ([0807227](https://github.com/clabroche/stack-monitor/commit/08072273fa2b3a7c3b133baddb2983771b68063c))
* **notifications:** can mute channel error from each command in settings ([ede9be5](https://github.com/clabroche/stack-monitor/commit/ede9be5f819d13364e2e96503e3ee70cdcf5181b))
* reenable documentation and improve global git view ([2e4dd75](https://github.com/clabroche/stack-monitor/commit/2e4dd75c0513d92f12b8303b3dddd2f2fa6ccc73))
* **stack-multiple:** resolve wrong tabs height ([32fcb7f](https://github.com/clabroche/stack-monitor/commit/32fcb7fac9c4ef464d13bcb9cfdc34bb7c480597))

## [2.0.11](https://github.com/clabroche/stack-monitor/compare/v2.0.10...v2.0.11) (2025-01-13)

### Bug Fixes

* and same for octokit/plugin-rest-endpoint-methods ([6a3e460](https://github.com/clabroche/stack-monitor/commit/6a3e46059860cdac48d0bb5f9b37be32ea5429ac))

## [2.0.10](https://github.com/clabroche/stack-monitor/compare/v2.0.9...v2.0.10) (2025-01-13)

### Bug Fixes

* fix-esm for octokit ([30f63bc](https://github.com/clabroche/stack-monitor/commit/30f63bc85a7480724a6a983d063ac0fe91bf7218))

## [2.0.9](https://github.com/clabroche/stack-monitor/compare/v2.0.8...v2.0.9) (2025-01-13)

**Note:** Version bump only for package @clabroche/stack-monitor

## [2.0.8](https://github.com/clabroche/stack-monitor/compare/v2.0.7...v2.0.8) (2025-01-13)

### Bug Fixes

* documentation + various bugfixes ([bddd9f6](https://github.com/clabroche/stack-monitor/commit/bddd9f6a5507a5a45ea2e54d0fe836e1e518c820))
* replace npm tag to version 2 ([3ca5665](https://github.com/clabroche/stack-monitor/commit/3ca56655b588e6e9449044e3f389fbb7c678481f))
* **windows:** add specific code to windows support ([f15719d](https://github.com/clabroche/stack-monitor/commit/f15719dd5cf13e076831c1bcfedf8497127068fe))

## [2.0.7](https://github.com/clabroche/stack-monitor/compare/v2.0.6...v2.0.7) (2025-01-05)

### Bug Fixes

* **windows:** fix windows support ([5590e7d](https://github.com/clabroche/stack-monitor/commit/5590e7de8f27c45ee76d401e53eeda6fcae5bbfe))

## [2.0.6](https://github.com/clabroche/stack-monitor/compare/v2.0.5...v2.0.6) (2025-01-04)

### Bug Fixes

* externalize packages since gpt read external file from his package ([e8e50a2](https://github.com/clabroche/stack-monitor/commit/e8e50a2729fef674e9c9bf831ab8c31dac2ffa75))

## [2.0.5](https://github.com/clabroche/stack-monitor/compare/v2.0.4...v2.0.5) (2025-01-04)

### Bug Fixes

* add missing deps for building server ([abffa86](https://github.com/clabroche/stack-monitor/commit/abffa86a56889384338d06213cad4370c2cbea17))
* attach heritage to environment instead of service + various fixes ([4647010](https://github.com/clabroche/stack-monitor/commit/4647010eadbf3370155faca171a0b10caea32baf))
* remove some dependencies ([5667402](https://github.com/clabroche/stack-monitor/commit/5667402d57add874a89ba029ce62b16b3bbed9e0))
* various fixes ([d3ac538](https://github.com/clabroche/stack-monitor/commit/d3ac538093a6d475cf1eca0f262a2accf91b3373))

## [2.0.4](https://github.com/clabroche/stack-monitor/compare/v2.0.3...v2.0.4) (2024-12-26)

### Bug Fixes

* cwd when prompt a command ([483001f](https://github.com/clabroche/stack-monitor/commit/483001f826b65f163b48278636a0d840c7b6703b))

## [2.0.3](https://github.com/clabroche/stack-monitor/compare/v2.0.2...v2.0.3) (2024-12-26)

### Bug Fixes

* load external deps ([bf3907b](https://github.com/clabroche/stack-monitor/commit/bf3907bd35fb6ae9711ed425de37c1f6c95286f7))

## [2.0.2](https://github.com/clabroche/stack-monitor/compare/v2.0.1...v2.0.2) (2024-12-26)

### Bug Fixes

* fix entrypoint loading ([8b35198](https://github.com/clabroche/stack-monitor/commit/8b35198cc2ab6e02cf5fd452dd65742ba90f1efa))

## [2.0.1](https://github.com/clabroche/stack-monitor/compare/v2.0.0...v2.0.1) (2024-12-25)

### Bug Fixes

* **docker:** fix volume paths with interpreted characters ([38eb09b](https://github.com/clabroche/stack-monitor/commit/38eb09b8f7cdab2799c4cad35d2ea9f66083ad70))
* **env_vars:** fix reactivity ([12f7180](https://github.com/clabroche/stack-monitor/commit/12f718070723d79e1adef9050894c131ec6343f9))
* various fixes ([18129e9](https://github.com/clabroche/stack-monitor/commit/18129e96f7c92a69176d6a75add45f3a48ab11ae))

# [2.0.0](https://github.com/clabroche/stack-monitor/compare/v1.18.12...v2.0.0) (2024-12-19)

* feat!: migrate stackmonitor to entire UI ([e173073](https://github.com/clabroche/stack-monitor/commit/e173073d932be7e400b1f51261c090116e8fb543))

### BREAKING CHANGES

* all stack files are useless now

## [1.18.12](https://github.com/clabroche/stack-monitor/compare/v1.18.11...v1.18.12) (2024-11-11)

### Bug Fixes

* authorize iframe from jsoncrack ([1faaab2](https://github.com/clabroche/stack-monitor/commit/1faaab27db8f2cd2c2199375df9d77fe8a9341b6))

## [1.18.11](https://github.com/clabroche/stack-monitor/compare/v1.18.10...v1.18.11) (2024-11-11)

### Bug Fixes

* remove eiwos ([86bbff3](https://github.com/clabroche/stack-monitor/commit/86bbff321bd3cd7a70faeb0de6ccbbe93be4bab4))
* remove eiwos ([12ff054](https://github.com/clabroche/stack-monitor/commit/12ff0548941856cd5ca627f1a0a157141366b3cf))

## [1.18.10](https://github.com/clabroche/stack-monitor/compare/v1.18.9...v1.18.10) (2024-11-11)

### Bug Fixes

* improve performance + add jsoncrack view ([c534a97](https://github.com/clabroche/stack-monitor/commit/c534a9749162f5f15589ec335da149656c757bfb))

## [1.18.9](https://github.com/clabroche/stack-monitor/compare/v1.18.8...v1.18.9) (2024-05-17)

### Bug Fixes

* **docker:** add bootstrap scripts ([040e036](https://github.com/clabroche/stack-monitor/commit/040e036dc53c67e875d2e1a6e2b6147ca4070754))
* increase turborepo and yarn version ([9d1d179](https://github.com/clabroche/stack-monitor/commit/9d1d17943af8f873b94bf736fdb2fa025eba5c34))

## [1.18.8](https://github.com/clabroche/stack-monitor/compare/v1.18.7...v1.18.8) (2024-03-19)

### Bug Fixes

* **configuration:** can search through envs ([3673cf9](https://github.com/clabroche/stack-monitor/commit/3673cf939a12fae76d851180fe79dcf01d6dcde7))
* **devcontainer:** add container support ([f2559fb](https://github.com/clabroche/stack-monitor/commit/f2559fb90bba3de5fcfef2c95dd45826358b7ad4))
* **docker:** add docker support ([f3abb42](https://github.com/clabroche/stack-monitor/commit/f3abb4237b8f708585769a8ff51c393d5f21dc5c))
* **docker:** add user to container ([3116d66](https://github.com/clabroche/stack-monitor/commit/3116d66459fe2877fa64183abbf2cb0599c7535a))
* **logs:** dont render html on simplified mode ([713b2c7](https://github.com/clabroche/stack-monitor/commit/713b2c736d9d4f62b791076450b01d4f657e7ff1))
* resolve issues for permission on docker volumes + cosmetic changes ([7a822cd](https://github.com/clabroche/stack-monitor/commit/7a822cd1c205e5808247075828c1d3ce49d1524b))
* **stackchooser:** redirect to the first launched service ([aa53535](https://github.com/clabroche/stack-monitor/commit/aa53535c16a4ae729d33fe3017c589e1f69e7ce5))

## [1.18.7](https://github.com/clabroche/stack-monitor/compare/v1.18.6...v1.18.7) (2024-02-25)

### Bug Fixes

* **extension:** notification on health down is too verbose ([a96aad7](https://github.com/clabroche/stack-monitor/commit/a96aad77ce6d01be5a8411bdd9a32d4f7c1ad438))

## [1.18.6](https://github.com/clabroche/stack-monitor/compare/v1.18.5...v1.18.6) (2024-02-25)

### Bug Fixes

* cosmetic changes ([87429f3](https://github.com/clabroche/stack-monitor/commit/87429f37a57d83f5d568fa4df13cb75e9e4145d1))
* **extension:** autodiscovery ([dcb1b24](https://github.com/clabroche/stack-monitor/commit/dcb1b24c486971a1538a86db9cfdf96f16244bff))
* **extension:** fix code lens ([d17b922](https://github.com/clabroche/stack-monitor/commit/d17b9228c15b9cb0acd21e3839fd0b85e07c5a69))
* **yarn:** upgrade to 4.1.0 ([439079a](https://github.com/clabroche/stack-monitor/commit/439079a46de4ea4c905799955278e95e195e3710))

## [1.18.5](https://github.com/clabroche/stack-monitor/compare/v1.18.4...v1.18.5) (2024-02-24)

### Bug Fixes

* create new version ([deebf7b](https://github.com/clabroche/stack-monitor/commit/deebf7bdd118dd1919995716ded6c5ba186afa05))

## [1.18.4](https://github.com/clabroche/stack-monitor/compare/v1.18.3...v1.18.4) (2024-02-24)

### Bug Fixes

* **front:** fix proxy url in production mode ([444f15b](https://github.com/clabroche/stack-monitor/commit/444f15be4f83145831f7bc653b09d54ef37f332b))

## [1.18.3](https://github.com/clabroche/stack-monitor/compare/v1.18.2...v1.18.3) (2024-02-24)

### Bug Fixes

* **front:** proxy image to prevent cors + close theme at startup ([cdebdf4](https://github.com/clabroche/stack-monitor/commit/cdebdf4d878acdcd4c71b39f45df7353acf86a9b))

## [1.18.2](https://github.com/clabroche/stack-monitor/compare/v1.18.1...v1.18.2) (2024-02-24)

### Bug Fixes

* **extension:** add command and keybinding to print variable into stack-monitor ([0c5d65f](https://github.com/clabroche/stack-monitor/commit/0c5d65fdf8a97ed312cc3bfcfa46f74590ca3895))
* **extension:** create vscodeextension ([dfb2589](https://github.com/clabroche/stack-monitor/commit/dfb258912ca717cca9b2dc857c2774bfddd59251))
* **front:** cosmetic changes ([ff9b282](https://github.com/clabroche/stack-monitor/commit/ff9b2821de658eae571a1da4407ec0651a102e15))

## [1.18.1](https://github.com/clabroche/stack-monitor/compare/v1.18.0...v1.18.1) (2024-02-20)

### Bug Fixes

* **theme:** cosmetic changes ([0da5cee](https://github.com/clabroche/stack-monitor/commit/0da5cee3b358d85bdc9c0fdf4907d7cd9b249e4a))

# [1.18.0](https://github.com/clabroche/stack-monitor/compare/v1.17.30...v1.18.0) (2024-02-19)

### Bug Fixes

* **documentation:** deployment for doc ([fb7dd7f](https://github.com/clabroche/stack-monitor/commit/fb7dd7f1f93c6e0dbaf9e17047b2e7c5b880a7e4))

### Features

* **swagger:** can read an opoenapi url from service ([481b543](https://github.com/clabroche/stack-monitor/commit/481b54305b2606f6f360287b17a4b4270a99eb3d))

## [1.17.30](https://github.com/clabroche/stack-monitor/compare/v1.17.29...v1.17.30) (2024-02-19)

### Bug Fixes

* **documentation:** add a global documentation ([0ef6b0f](https://github.com/clabroche/stack-monitor/commit/0ef6b0f15760d06380e9d7df3fc9c3a0393305d5))
* **documentation:** add documentation for documentation ([6290ce7](https://github.com/clabroche/stack-monitor/commit/6290ce7fc6aa070c1fb0f99e0cd815e5f51391b1))
* **documentation:** deployment for doc ([acacca6](https://github.com/clabroche/stack-monitor/commit/acacca68f431eb78a9852d67191ab454c1d59e4b))

## [1.17.29](https://github.com/clabroche/stack-monitor/compare/v1.17.28...v1.17.29) (2024-02-15)

### Bug Fixes

* **theme:** add black theme ([bee4697](https://github.com/clabroche/stack-monitor/commit/bee469731be182ac929298dc13fe1c230eccb7ba))

## [1.17.28](https://github.com/clabroche/stack-monitor/compare/v1.17.27...v1.17.28) (2024-02-14)

### Bug Fixes

* **front:** fix cors policy ([2ee35e1](https://github.com/clabroche/stack-monitor/commit/2ee35e1178c07507c1ca49b1a2db4f5c17755b58))

## [1.17.27](https://github.com/clabroche/stack-monitor/compare/v1.17.26...v1.17.27) (2024-02-14)

### Bug Fixes

* **front:** change icon ([b012ab7](https://github.com/clabroche/stack-monitor/commit/b012ab7dea9dde695cbfd95b2f4dbc446211db0a))

## [1.17.26](https://github.com/clabroche/stack-monitor/compare/v1.17.25...v1.17.26) (2024-02-14)

### Bug Fixes

* **server:** healthcheck working ([13d2960](https://github.com/clabroche/stack-monitor/commit/13d2960ffa5125aff7792d95a9306fe6e04d2889))
* **server:** resolve dependencies ([7a15ef0](https://github.com/clabroche/stack-monitor/commit/7a15ef01ba9946fb2662c0f15a6da758f0c40280))
* various changes ([06e6241](https://github.com/clabroche/stack-monitor/commit/06e624176595b95c4227fe684242919c7eeda192))

## [1.17.25](https://github.com/clabroche/stack-monitor/compare/v1.17.24...v1.17.25) (2024-02-12)

### Bug Fixes

* add link to stackmonitor help ([62c1d4e](https://github.com/clabroche/stack-monitor/commit/62c1d4e07455759e6468133b2ee7fa4ed1cb8cb6))
* cosmetic changes ([a18735e](https://github.com/clabroche/stack-monitor/commit/a18735e5b5cec706f3cdf4c4f4ca22482ce7ea0f))

## [1.17.24](https://github.com/clabroche/stack-monitor/compare/v1.17.23...v1.17.24) (2024-02-11)

### Bug Fixes

* link front to backend deps ([351abfd](https://github.com/clabroche/stack-monitor/commit/351abfd8f8cde96bce80d5202a78dd1daabbf6bb))

## [1.17.23](https://github.com/clabroche/stack-monitor/compare/v1.17.21...v1.17.23) (2024-02-11)

### Bug Fixes

* link front to backend deps ([66b3135](https://github.com/clabroche/stack-monitor/commit/66b313523d99765b692208de0043303dcb6a0914))
* link front to backend deps ([54fcbf3](https://github.com/clabroche/stack-monitor/commit/54fcbf371cf03dc4f51a7196de15fe5d352088e9))

## [1.17.22](https://github.com/clabroche/stack-monitor/compare/v1.17.21...v1.17.22) (2024-02-11)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.21](https://github.com/clabroche/stack-monitor/compare/v1.17.20...v1.17.21) (2024-02-11)

### Bug Fixes

* link front to backend deps ([91b2dce](https://github.com/clabroche/stack-monitor/commit/91b2dcefddc5d51520f7cd8ec31b4289461a9077))

## [1.17.20](https://github.com/clabroche/stack-monitor/compare/v1.17.19...v1.17.20) (2024-02-11)

### Bug Fixes

* link front to backend deps ([8e46943](https://github.com/clabroche/stack-monitor/commit/8e469434e8142afcb47b9589edb0b95e9bf32c71))

## [1.17.19](https://github.com/clabroche/stack-monitor/compare/v1.17.18...v1.17.19) (2024-02-11)

### Bug Fixes

* fix ci ([47d1230](https://github.com/clabroche/stack-monitor/commit/47d12308afc56e027c4c3faebba4dc24e16e6731))

## [1.17.18](https://github.com/clabroche/stack-monitor/compare/v1.17.15...v1.17.18) (2024-02-11)

### Bug Fixes

* build for npm ([0c07b41](https://github.com/clabroche/stack-monitor/commit/0c07b410a237412c1c73bbb42fe45c1f9c220482))
* no cyclic dependencies ([496f153](https://github.com/clabroche/stack-monitor/commit/496f153c9492fc25873f1498a0b1f22556601eed))
* resolve conflict ([e29ed8c](https://github.com/clabroche/stack-monitor/commit/e29ed8c50536109b0a05ec24d212b03a0f0b7922))
* sync yarn.lock ([a1debd2](https://github.com/clabroche/stack-monitor/commit/a1debd247fc9b8f1e8eac8049949415b6d02fd2e))

## [1.17.15](https://github.com/clabroche/stack-monitor/compare/v1.17.14...v1.17.15) (2024-02-07)

### Bug Fixes

* **logs:** fix json load on ui ([bae5dd8](https://github.com/clabroche/stack-monitor/commit/bae5dd829faf72d59215a3a9941155af6413a3eb))

## [1.17.14](https://github.com/clabroche/stack-monitor/compare/v1.17.13...v1.17.14) (2024-02-05)

### Bug Fixes

* **front:** can edit markdown and migrate away from vue markdown ([ef11ae3](https://github.com/clabroche/stack-monitor/commit/ef11ae39ee563ee6af4b2bc6f916f4c4705287dd))
* **front:** fix drag n drop ([39f5d4b](https://github.com/clabroche/stack-monitor/commit/39f5d4b2c9d69500402a8cf76e373836c5e9b596))

## [1.17.13](https://github.com/clabroche/stack-monitor/compare/v1.17.12...v1.17.13) (2024-02-05)

### Bug Fixes

* **openai:** dont initialize openai if no apikey is configured ([0746e78](https://github.com/clabroche/stack-monitor/commit/0746e786fc54ae832b09ba5b99a33dc1d741da6f))

## [1.17.12](https://github.com/clabroche/stack-monitor/compare/v1.17.11...v1.17.12) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.11](https://github.com/clabroche/stack-monitor/compare/v1.17.10...v1.17.11) (2024-02-04)

### Bug Fixes

* link modules between them ([a9a087c](https://github.com/clabroche/stack-monitor/commit/a9a087c7cd00ba09bdf075e476d6ea669a86dc06))

## [1.17.10](https://github.com/clabroche/stack-monitor/compare/v1.17.9...v1.17.10) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.9](https://github.com/clabroche/stack-monitor/compare/v1.17.8...v1.17.9) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.8](https://github.com/clabroche/stack-monitor/compare/v1.17.7...v1.17.8) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.7](https://github.com/clabroche/stack-monitor/compare/v1.17.6...v1.17.7) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.6](https://github.com/clabroche/stack-monitor/compare/v1.17.5...v1.17.6) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.5](https://github.com/clabroche/stack-monitor/compare/v1.17.4...v1.17.5) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.4](https://github.com/clabroche/stack-monitor/compare/v1.17.3...v1.17.4) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor

## [1.17.3](https://github.com/clabroche/stack-monitor/compare/v1.11.23...v1.17.3) (2024-02-04)

**Note:** Version bump only for package @clabroche/stack-monitor
