import Watcher from '../Watcher.js'
import compileToFunction from './compileToFunction.js'

export function mount(vm) {
  if (!vm.$option.render) {
    let templateStr = ''
    const { el, template } = vm.$option
    // 根文件
    if (el) {
      templateStr = document.querySelector(el).outerHTML
      vm.$el = document.querySelector(el)
      // 组件
    } else if (template) {
      templateStr = template
    }

    const render = compileToFunction(templateStr)
    vm.$option.render = render
  }

  mountComponent(vm)
}

export function mountComponent(vm) {
  const updateComponent = () => {
    console.log('update render')
  }
  new Watcher(updateComponent)
}
