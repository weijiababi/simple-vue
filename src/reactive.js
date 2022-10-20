import Dep from './Dep.js'

export default function defineReactive(target, key, val) {
  // 属性的发布者
  const dep = new Dep()

  Object.defineProperty(target, key, {
    get() {
      /*
      Dom上通过指令或者双大括号绑定的数据，会为数据进行添加观察者watcher，当实例化Watcher的时候 会触发属性的getter方法,此时需要将
      该watcher添加到监听内
      */

      // 如果有订阅者，那么就拦截，添加进watcherList
      if (Dep.target) {
        dep.attach()
      }
      return val
    },
    set(value) {
      if (val === value) {
        return
      }
      val = value
      dep.notify()
    },
  })
}
