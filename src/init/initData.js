import { isNil } from '../utils.js'
import Observer from '../Observer.js'

export function initData(vm) {
  const { data } = vm.$option

  if (isNil(data)) {
    return
  }

  let _data = typeof data === 'function' ? data() : data ?? {}
  vm._data = _data

  proxyData(vm, _data)
  observe(vm._data)
}

// 对所有属性值进行代理
function proxyData(vm, data) {
  const proxyDataToVm = function (target, sourceKey, key) {
    Object.defineProperty(target, key, {
      get() {
        return target[sourceKey][key]
      },
      set(val) {
        target[sourceKey][key] = val
      },
    })
  }

  for (const key in data) {
    proxyDataToVm(vm, '_data', key)
  }
}

// 对所有属性值进行监听
function observe(data) {
  if (!isNil(data.__ob__)) {
    return data.__ob__
  }
  return new Observer(data)
}
