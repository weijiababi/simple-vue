// 官方使用了两个参数标记当前Watcher是否是计算属性
// options : { lazy: true } 表示是计算属性
// watcher.dirty : 保存当前计算属性的缓存状态, true需要执行缓存 false表示已经缓存过了，不需要缓存了

/**
 * 初始化watcher的时候，如果调用了get方法取值，就会将自己缓存在dep.target上面，
 * 而cb方法调用取值，那么defineReactive中的get方法就会将该watcher绑定在监听列表上，
 * 而后在移除dep.target
 *
 * cb方法中用到了vm的哪个值，哪个值的 defineReactive get方法就会将此watcher绑定上监听列表
 */

import { pushTarget, popTarget } from './Dep.js'

let uid = 0
export default class Watcher {
  constructor(cb, options = {}, vm = null) {
    this._uid = uid++
    this._cb = cb
    this.options = options
    this.vm = vm
    this.dirty = !options.dirty // 默认若不传则为true,用于标识数据是否需要刷新,普通watcher一直为true，而computed会在依赖更新重新计算后设为false
    this.value = null

    // 非懒执行，直接取值（lazy用来做computed标识）
    if (!options.lazy) {
      this.get()
    }
  }

  get() {
    pushTarget(this) // 缓存当前watcher到dep.target上
    this.value = this._cb.apply(this.vm) // 调用取值，defineReactive中的get方法会将当前缓存的target绑定到该属性值的watcherList上
    popTarget() // 移除dep.target上的watcher
  }

  /**
   * 执行 computed 计算属性的回调函数并缓存
   */
  evalute() {
    this.get()
    this.dirty = false // 表示已缓存，实现一次刷新周期内 computed 只执行一次
  }

  update() {
    if (this.options.lazy) {
      this.dirty = true
    } else {
      // 渲染更新
      console.log('dom render need update')
    }
  }
}
