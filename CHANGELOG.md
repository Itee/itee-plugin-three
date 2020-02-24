## [1.2.7](https://github.com/Itee/itee-plugin-three/compare/v1.2.6...v1.2.7) (2020-02-24)


### Bug Fixes

* **maps:** remove old production maps ([68ad9d4](https://github.com/Itee/itee-plugin-three/commit/68ad9d4cc0bcd34f8a6392439bd8f6fd53287bf1))
* **package:** move three-full as peer dependency to avoid duplicate code in final client bundle ([9a880ca](https://github.com/Itee/itee-plugin-three/commit/9a880ca858d0d19da9b36d79741b6c4221fcedf6))

## [1.2.6](https://github.com/Itee/itee-plugin-three/compare/v1.2.5...v1.2.6) (2020-02-24)


### Bug Fixes

* **clippingcontrols:** add missings update matrix call, and update management ([ece63f4](https://github.com/Itee/itee-plugin-three/commit/ece63f429f90bde0d3cceea333589c1faa2e5b9e))

## [1.2.5](https://github.com/Itee/itee-plugin-three/compare/v1.2.4...v1.2.5) (2020-02-20)


### Bug Fixes

* **threetomongodb:** fix asynchronous call during insert and clean comments ([49da370](https://github.com/Itee/itee-plugin-three/commit/49da3700b04be95266cb18f229e8e1b6aa2cb416))

## [1.2.4](https://github.com/Itee/itee-plugin-three/compare/v1.2.3...v1.2.4) (2020-02-18)


### Bug Fixes

* **global:** update addAttribute method name to setAttribute ([33dd279](https://github.com/Itee/itee-plugin-three/commit/33dd27917d5260da20f0816f139b41378d767f3a))
* **global:** update applyMatrix method name to applyMatrix4 ([f2672c5](https://github.com/Itee/itee-plugin-three/commit/f2672c57b8469b3870b8727fd59fda26343d8f0b))

## [1.2.3](https://github.com/Itee/itee-plugin-three/compare/v1.2.2...v1.2.3) (2020-02-18)


### Bug Fixes

* **rzmloader:** fix _Math three js import that is now MathUtils ([2554fa3](https://github.com/Itee/itee-plugin-three/commit/2554fa38f80fce9b89d5ad141d62af3b3d9dc110))

## [1.2.2](https://github.com/Itee/itee-plugin-three/compare/v1.2.1...v1.2.2) (2020-02-18)


### Bug Fixes

* **package:** fix package version and peer dependencies ([2fc685c](https://github.com/Itee/itee-plugin-three/commit/2fc685ce718b95a65d77281817c6494517651a4d))

## [1.2.1](https://github.com/Itee/itee-plugin-three/compare/v1.2.0...v1.2.1) (2020-02-17)


### Bug Fixes

* **package:** update package lock ([a14967b](https://github.com/Itee/itee-plugin-three/commit/a14967b15787f542894754e6cd162e987f35eda7)), closes [#2](https://github.com/Itee/itee-plugin-three/issues/2)

# [1.2.0](https://github.com/Itee/itee-plugin-three/compare/v1.1.2...v1.2.0) (2020-02-17)


### Bug Fixes

* **cameracontrols:** add missing consume event ([1ef2b0d](https://github.com/Itee/itee-plugin-three/commit/1ef2b0d))
* **clippingcontrols:** fix wrong variable name and usage ([e2f3f36](https://github.com/Itee/itee-plugin-three/commit/e2f3f36))
* **mongodbthreeplugin:** update package references for inheritance ([a24c2b2](https://github.com/Itee/itee-plugin-three/commit/a24c2b2))
* **threetomongodb:** update async await management and remove nested async promisified function ([1d4df5e](https://github.com/Itee/itee-plugin-three/commit/1d4df5e))


### Features

* **cameracontrols:** start implementing orthographic camera displacement ([9686ad0](https://github.com/Itee/itee-plugin-three/commit/9686ad0))
* **clippingbox:** allow to set a clipping margin ([3aaeafe](https://github.com/Itee/itee-plugin-three/commit/3aaeafe))
* **collada:** add colladatothree converter ([d6c5305](https://github.com/Itee/itee-plugin-three/commit/d6c5305))
* **fbx:** add fbxtothree converter ([7f2c260](https://github.com/Itee/itee-plugin-three/commit/7f2c260))
* **stl:** add stltothree converter ([51a03da](https://github.com/Itee/itee-plugin-three/commit/51a03da))
* **tds:** add tdstothree converter ([e5ec267](https://github.com/Itee/itee-plugin-three/commit/e5ec267))
* **threetomongodb:** add different type of merge strategie. Clean up ([3e42a24](https://github.com/Itee/itee-plugin-three/commit/3e42a24))


### Performance Improvements

* **orbitcontrolshelper:** disable matrixautoupdate ([a2eb531](https://github.com/Itee/itee-plugin-three/commit/a2eb531))

## [1.1.2](https://github.com/Itee/itee-plugin-three/compare/v1.1.1...v1.1.2) (2019-10-21)


### Bug Fixes

* **clippingcontrols:** use literral enum for clipping mode and fix this._mode usage ([3a4c881](https://github.com/Itee/itee-plugin-three/commit/3a4c881))

## [1.1.1](https://github.com/Itee/itee-plugin-three/compare/v1.1.0...v1.1.1) (2019-09-26)


### Bug Fixes

* **package:** update packages and fix version ([cb78622](https://github.com/Itee/itee-plugin-three/commit/cb78622))

# [1.1.0](https://github.com/Itee/itee-plugin-three/compare/v1.0.0...v1.1.0) (2019-08-14)


### Bug Fixes

* **cameracontrols:** fix invalid cameracontrolmode enum instance ([e45e104](https://github.com/Itee/itee-plugin-three/commit/e45e104))
* **clippingcontrols:** fix invalid enum instance of clippingmodes ([fb2ad92](https://github.com/Itee/itee-plugin-three/commit/fb2ad92))
* **converters:** update loaders path and fix ctor arguments ([eb6ab31](https://github.com/Itee/itee-plugin-three/commit/eb6ab31))


### Features

* **mongodbthreeplugin:** add all missings type and shcemas ([92d1c21](https://github.com/Itee/itee-plugin-three/commit/92d1c21))

# 1.0.0 (2019-08-13)


### Build System

* **global:** populate ([e7017e9](https://github.com/Itee/itee-plugin-three/commit/e7017e9))


### BREAKING CHANGES

* **global:** Add all files
