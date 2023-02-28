import Watcher from '../reactive/Watcher.js'

export default function initComputed(vm) {
  const computeds =
    typeof vm.$option.computed === 'object' ? vm.$option.computed : {}
  const watcherObj = (vm._watcher = Object.create(null))

  for (let key in computeds) {
    watcherObj[key] = new Watcher(computeds[key], { lazy: true }, vm)
    proxyComputedToVm({
      vm,
      key,
    })
  }
}

// 代理计算属性computed到Vm实例上
function proxyComputedToVm({ vm, key }) {
  Object.defineProperty(vm, key, {
    get() {
      // 拿到当前key的computed的watcher
      const watcher = vm._watcher[key]
      // 如果数据dirty为true，证明未缓存或者未更新取值，则调用一个evalute进行更新
      if (watcher.dirty) {
        watcher.evalute()
      }
      return watcher.value
    },
    set() {
      console.warn(`---computeds ${key} can't be set as value!---`)
    },
  })
}
