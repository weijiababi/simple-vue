export function initMethods(vm) {
  const methods =
    typeof vm.$option.methods === 'object' ? vm.$option.methods : {}

  proxyMethods(vm, methods)
}

function proxyMethods(vm, methods) {
  const proxyMethodToVm = function (target, key) {
    Object.defineProperty(target, key, {
      get() {
        return methods[key]
      },
      set(_val) {
        console.warn(`---methods ${key} can't be set as value!---`)
      },
    })
  }

  for (const key in methods) {
    proxyMethodToVm(vm, key)
  }
}
