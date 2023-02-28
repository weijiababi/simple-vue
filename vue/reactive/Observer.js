import { defineReactive } from './defineReactive.js'
import Dep from './Dep.js'

window.$keyert = 0 // js文件引入后，初始执行一次

export default class Observer {
  constructor(data) {
    this.initDep(data)
    window.$keyert++
    this.walk(data)
  }

  initDep(data) {
    // 给每个数据都加上一个 __ob__ 属性 表示已经处理了响应式拦截和更新
    Object.defineProperty(data, '__ob__', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: this,
    })
    // 对值进行依赖收集
    data.__ob__.dep = new Dep()
  }

  walk(data) {
    for (let key in data) {
      defineReactive({
        data,
        key,
        value: data[key],
      })
    }
  }
}
