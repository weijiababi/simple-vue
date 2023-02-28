import compileToFunction from './compiler/compileToFunction.js'
import Watcher from './reactive/Watcher'
import { isNil } from './utils.js'

export function mount(vm) {
  if (isNil(vm.$option.render)) {
    const $option = vm.$option
    const { template, el } = $option
    let templateStr = ''
    // 子组件
    if (template) {
      templateStr = template
    } else if (el) {
      const dom = document.querySelector(el)
      templateStr = dom.outerHTML
      vm.$el = dom
    }

    const render = compileToFunction(templateStr)
    vm.$option.render = render // 生成了render函数，而render函数执行又可以生成vnode节点
  }
  mountComponent(vm)
}

function mountComponent(vm) {
  const updateComponent = () => {
    vm._update(vm._render())
  }
  new Watcher(updateComponent)
}
