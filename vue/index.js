import { createElement, createTextNode } from './compiler/renderHelper.js'
import initComputed from './init/initComputeds.js'
import initData from './init/initData.js'
import initMethodes from './init/initMethods.js'
import { mount } from './mount.js'
import { update } from './update.js'
import { patch } from './compiler/patch.js'
import { nextTick } from './reactive/queueWatcher'
export default class Vue {
  constructor(option) {
    this.$option = option
    this._init()
    this._initRenderMethod()
    this.$nextTick = nextTick

    if (this.$option.el) {
      this.$mount()
    }
  }

  // 初始化各类属性
  _init() {
    initData(this) // 初始化数据
    initMethodes(this) // 初始化方法
    initComputed(this) // 初始化计算属性
  }

  // 安装渲染工具函数
  _initRenderMethod() {
    this._c = createElement
    this._v = createTextNode
    this.__patch__ = patch
  }

  $mount() {
    mount(this) // 挂载节点，生成渲染函数(本质就是初始化this.$option.render)
  }

  _render() {
    return this.$option.render.apply(this)
  }

  _update(VNode) {
    return update.call(this, VNode)
  }
}
