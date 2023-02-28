import { pushTarget, popTarget } from './Dep'
import { queueWatcher } from './queueWatcher'

let uid = 0
export default class Watcher {
  constructor(cb, option = {}, vm = null) {
    this._cb = cb
    // 记录配置项
    this.option = option
    this.vm = vm
    this._uid = uid++
    // dirty 计算属性实现缓存的本质 状态 true 未缓存 false 已缓存
    this.dirty = !option.dirty // 初始若为空，则设置为true
    this.value = null

    // 如果非懒执行, 则直接执行cb函数，cb函数执行的过程会触发 vm.xx 的属性读取行为
    if (!option.lazy) {
      this.get()
    }
  }

  get() {
    pushTarget(this)
    this.value = this._cb.call(this.vm)
    popTarget()
  }

  evalute() {
    this.get()
    this.dirty = false
  }

  update() {
    // 代表为计算属性
    if (this.option.lazy) {
      // 提示依赖更新，数据需要重新计算
      this.dirty = true
    } else {
      // 只要data发生变化，渲染更新函数必定走到这个逻辑
      queueWatcher(this) // 处理异步队列
    }
  }
}
