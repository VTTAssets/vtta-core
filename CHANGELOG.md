# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.1](https://github.com/VTTAssets/vtta-core/compare/v1.2.0...v1.2.1) (2021-03-24)


### Bug Fixes

* Compatibility with The Forge and Asset Library increased ([feb69f4](https://github.com/VTTAssets/vtta-core/commit/feb69f4f7f48795d819c983708f2fc66b07052d4))

## 1.2.0 (2021-03-24)

### Features

- Image download is first tried without proxy, and then on error with a proxy ([08349ed](https://github.com/VTTAssets/vtta-core/commit/08349ed0c5c8efd803b64ebccb4abebf1bf06c7f))

### Bug Fixes

- Custom setting handlers registered on settings renderer ([68910ee](https://github.com/VTTAssets/vtta-core/commit/68910ee55e2d8e7a7399c667ae04126ae799513f))
- Logger now accepts single strings without data ([bcf271c](https://github.com/VTTAssets/vtta-core/commit/bcf271c0e9680dbad5a271d22d7f278842c1b461))
- Reverted renderSettingsConfig change to the actually used renderSettingsApplication by the centralized config panel ([06d51a6](https://github.com/VTTAssets/vtta-core/commit/06d51a6eb2cd3729bc6dd9cef449014736037538))
