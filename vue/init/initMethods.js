export default function initMethodes(vm) {
  const methods =
    typeof vm.$option.methods === 'object' ? vm.$option.methods : {}

  proxyMethod(vm, methods)
}

function proxyMethod(vm, methods) {
  const proxyMethodToVm = ({ target, key, fn }) => {
    Object.defineProperty(target, key, {
      get() {
        return fn.bind(this)
      },
      set() {
        console.warn(`---methods ${key} can't be set as value!---`)
      },
    })
  }
  for (let key in methods) {
    proxyMethodToVm({
      target: vm,
      key,
      fn: methods[key],
    })
  }
}
