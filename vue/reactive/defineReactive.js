import Dep from './Dep.js'

export function defineReactive({ data, key, value }) {
  const dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      // 任何使用到此值的watcher都会被添加本key的watherList
      if (Dep.target) {
        dep.attach()
      }
      // 为什么不能直接用data[key]，会造成死循环，是因为如果return data[key],相当于又调用了data[key]的get，就造成了循环，所以Object.defineProperty中的第二个参数，不可以跟data中的取值key相同
      return value
    },
    set(newVal) {
      if (newVal === value) {
        return
      }
      value = newVal
      dep.notify()
    },
  })
}
