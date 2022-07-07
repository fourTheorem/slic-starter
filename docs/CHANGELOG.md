# [1.5.0](https://github.com/fourTheorem/slic-starter/compare/1.4.1...1.5.0) (2022-07-07)


### Bug Fixes

* ensure test-common package is imported and exported correctly ([c9373f3](https://github.com/fourTheorem/slic-starter/commit/c9373f3d55da59063de4d5eb2166805f29094b1b))


### Features

* **email-service:** convert package to esm ([ed6d79c](https://github.com/fourTheorem/slic-starter/commit/ed6d79cea337dcd526e7100e1a6bf929dc41a05b))
* move checklist-service and slic tools to esm ([fdb14f0](https://github.com/fourTheorem/slic-starter/commit/fdb14f0712d6346bf3bee30c0f9d713a0bee69c8))
* replace nyc with c8 to work with esm modules ([0c50a58](https://github.com/fourTheorem/slic-starter/commit/0c50a58267f3fc1e9846a2a6c1d7a38a3352c3de))
* **sharing-service:** convert package to esm ([0912c1f](https://github.com/fourTheorem/slic-starter/commit/0912c1f64ab2e6aa8bdaf1612a360b9407512e9b))
* update all int and e2e tests packages to esm ([5a8afd3](https://github.com/fourTheorem/slic-starter/commit/5a8afd309c189c8c88654f3824d43e28ee13029d))
* update root to esm ([9e704c2](https://github.com/fourTheorem/slic-starter/commit/9e704c24e877ff4e92100b99b032f77e571eef5e))
* **user-service:** convert package to esm ([d612051](https://github.com/fourTheorem/slic-starter/commit/d61205104d8508125c1dcf5fb6f0157893269dde))
* **user-service:** convert package to esm ([e79d366](https://github.com/fourTheorem/slic-starter/commit/e79d366cc6d57865a13bda40be8aa12622580a77))

## [1.4.1](https://github.com/fourTheorem/slic-starter/compare/1.4.0...1.4.1) (2022-07-06)


### Bug Fixes

* **int-test:** ensure the correct args are passed to the http client ([87ab426](https://github.com/fourTheorem/slic-starter/commit/87ab4266c4be6deca0dc7641a0e98b7786c48cae))

# [1.4.0](https://github.com/fourTheorem/slic-starter/compare/1.3.0...1.4.0) (2022-07-01)


### Features

* replace all aws-sdk v2 usages with aws sdk v3 clients ([c0fa19a](https://github.com/fourTheorem/slic-starter/commit/c0fa19a2b6da099129737551d8c2fd4765525c42))
* **util:** use aws sdk v3 client for ssm ([237e0dc](https://github.com/fourTheorem/slic-starter/commit/237e0dc38526cb8f443c12d4bff94e0ea2974dc3))

# [1.3.0](https://github.com/fourTheorem/slic-starter/compare/1.2.0...1.3.0) (2022-06-29)


### Bug Fixes

* **checklist-service:** use cjs require for aws-sdk v3 dynamo ([c3ea5be](https://github.com/fourTheorem/slic-starter/commit/c3ea5be84be40d53b621fcb0fbe352822a7f0297))


### Features

* **checklist-service:** migrate entries db ops to aws sdk v3 ([1ebfd54](https://github.com/fourTheorem/slic-starter/commit/1ebfd546d585927c6c664977d5c95e4b07742a7d))
* **checklist-service:** upgrade checklist db ops to use aws-sdk v3 ([4078080](https://github.com/fourTheorem/slic-starter/commit/4078080122fde18d63c28606fb9c8aae2051256e))
* **slic-tools:** update event-dispatcher to use aws sdk v3 ([e2a260d](https://github.com/fourTheorem/slic-starter/commit/e2a260dd9af7f2b4366bfdb53d49bf686674599f))

# [1.2.0](https://github.com/fourTheorem/slic-starter/compare/1.1.0...1.2.0) (2022-06-28)


### Features

* **user-service:** use aws-sdk v3 ([49a93e1](https://github.com/fourTheorem/slic-starter/commit/49a93e182373b792d726f1365d0f1fc6c3fe6d0e))

# [1.1.0](https://github.com/fourTheorem/slic-starter/compare/1.0.0...1.1.0) (2022-06-28)


### Features

* **email-service:** use aws-sdk v3 ([e74f19b](https://github.com/fourTheorem/slic-starter/commit/e74f19b85adfd8580208e2bf8332787fad27d9d4))

# 1.0.0 (2022-06-27)


### Bug Fixes

* **cicd:** update test codebuild build spec paths ([9a1e981](https://github.com/fourTheorem/slic-starter/commit/9a1e981585670a60d6bf6053816ea905d18877e7))
* **deploy-module:** set the correct path for sls bin ([a3dcbab](https://github.com/fourTheorem/slic-starter/commit/a3dcbabb51a82d89b3b7eb96bf5905e3389fc325))
* **e2e-tests:** ensure testcafe scripts wraps quotes around browser name ([3c916fb](https://github.com/fourTheorem/slic-starter/commit/3c916fbd534980f23b97236d47468fad63097f4a))
* ensure http middlewares are only applied to http handlers ([d2f7850](https://github.com/fourTheorem/slic-starter/commit/d2f78506fd2ed8e96be944bf32f8d1574a6c7c93))
* **frontend:** require http-middleware-proxy using v2 named exports ([a3ec399](https://github.com/fourTheorem/slic-starter/commit/a3ec399bbcf2115e5c2f0b830d7d0c4d49f1a08c))
* **frontend:** update app.yml path in script ([1427761](https://github.com/fourTheorem/slic-starter/commit/14277616d54dd3a0dca2b482fcd1d35b353fe056))
* **frontend:** update site config app.yml path ([102d5ef](https://github.com/fourTheorem/slic-starter/commit/102d5ef7b930173047ec1dc4596f727ab360b276))
* **integration-tests:** run integration tests in pipeline where e2e was mistakely run twice ([eef4a87](https://github.com/fourTheorem/slic-starter/commit/eef4a87d3e4148f3c03f737047667d13f09fddf5))
* **sharing-service:** ensure a valid apigw response is returned in confirm handler ([625ff18](https://github.com/fourTheorem/slic-starter/commit/625ff188e339d2b1d50a89997bfae7654735a843))


### Features

* add semver releases ([bbc348f](https://github.com/fourTheorem/slic-starter/commit/bbc348fb8afd6753562c0127690a1573459364ac))


### Reverts

* Revert "Fix Integration Tests failing when running locally" ([17aaae9](https://github.com/fourTheorem/slic-starter/commit/17aaae9525a6cc92d35fa54e58dbf7f1de408098))
