/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.compatibleWith('quasar', '^1.0.0')
  api.compatibleWith('@quasar/app', '^1.0.0')

  api.extendQuasarConf(extendConf)
}

function extendConf (conf) {
    conf.boot.push('~quasar-app-extension-blue/src/boot/register-blue.js')
    conf.build.transpileDependencies.push(/quasar-app-extension-blue[\\/]src/)
}
