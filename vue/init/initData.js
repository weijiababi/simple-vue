import Observer from '../reactive/Observer.js'
import { isNil } from '../utils.js'

export default function initData(vm) {
  const { data = {} } = vm.$option
  const _data = typeof data === 'function' ? data() : data ?? {}
  vm._data = _data

  proxyData(vm)
  observeData(vm)
}

function proxyData(vm) {
  // 调用this.name的时候实际是代理到this._data.name，修改同理
  const proxyDataToVm = ({ vm, prefixKey, valueKey }) => {
    Object.defineProperty(vm, valueKey, {
      get() {
        return vm[prefixKey][valueKey]
      },
      set(v) {
        vm[prefixKey][valueKey] = v
      },
    })
  }

  const { _data } = vm
  for (const key in _data) {
    proxyDataToVm({
      vm,
      prefixKey: '_data',
      valueKey: key,
    })
  }
}

function observeData(vm) {
  if (!isNil(vm.__ob__)) {
    return vm.__ob__
  }
  return new Observer(vm._data)
}
