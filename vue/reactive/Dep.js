import { isNil } from '../utils.js'
const GLOBAL = {}

// Dep 不仅是订阅者 他订阅后还要收集watcher来更新模板 所以Dep也可以说是发布者，充当的是中介的角色
export default class Dep {
  constructor() {
    this.watcherList = []
  }

  static target = null

  attach() {
    if (isNil(Dep.target) || this.watcherList.includes(Dep.target)) {
      return
    }
    this.watcherList.push(Dep.target)

    // 全局的发布者对象
    if (!GLOBAL[window.$keyert]) {
      GLOBAL[window.$keyert] = []
    }
    if (!GLOBAL[window.$keyert].includes(Dep.target)) {
      GLOBAL[window.$keyert].push(Dep.target)
      window.$globalDep = GLOBAL
    }
  }

  notify() {
    this.watcherList.forEach((watcher) => {
      watcher.update()
    })
  }
}

const targetStack = []
export function pushTarget(watcher) {
  Dep.target = watcher
  targetStack.push(watcher)
}
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1] // 将Dep.target设置为最末尾一个
}
