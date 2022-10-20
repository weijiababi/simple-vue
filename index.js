import { initData } from './src/init/initData.js'
import { initMethods } from './src/init/initMethods.js'
import { initComputed } from './src/init/initComputed.js'
import { mount } from './src/compiler/mount.js'
export default function Vue(option) {
  this._init(option)
}

Vue.prototype._init = function (option) {
  this.$option = option

  initData(this)
  initMethods(this)
  initComputed(this)

  if (this.$option.el) {
    this.$mount()
  }
}

Vue.prototype.$mount = function () {
  mount(this)
}

Vue.prototype._render = function () {
  return this.$option.render.apply(this)
}
