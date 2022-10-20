import Dep from './Dep.js'
import defineReactive from './reactive.js'
export default class Observer {
  constructor(data) {
    this.initDep(data)
    this.walk(data)
  }

  initDep(data) {
    Object.defineProperty(data, '__ob__', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: this,
    })

    data.__ob__.dep = new Dep()
  }

  walk(data) {
    for (const key in data) {
      defineReactive(data, key, data[key])
    }
  }
}
