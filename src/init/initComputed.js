import Watcher from '../Watcher.js'

export function initComputed(vm) {
  const computeds = vm.$option.computed || {}
  const watcher = (vm._watcher = Object.create(null))

  for (const key in computeds) {
    watcher[key] = new Watcher(computeds[key], { lazy: true }, vm)
    proxyComputedToVm(vm, key)
  }
}

const proxyComputedToVm = (target, key) => {
  const descriptor = {
    get() {
      const watcher = target._watcher[key]
      if (watcher.dirty) {
        // 若未缓存执行过，则执行一次并返回值
        watcher.evalute()
      }
      return watcher.value
    },
    set(_val) {
      console.warn(`---computeds ${key} can't be set as value!---`)
    },
  }
  Object.defineProperty(target, key, descriptor)
}
