// 发布者
export default class Dep {
  constructor() {
    this.watcherList = []
  }
  static target = null // 临时存储订阅者

  attach() {
    if (!Dep.target) {
      return
    }
    this.watcherList.push(Dep.target)
  }

  notify() {
    this.watcherList.forEach((watcher) => {
      watcher.update()
    })
  }
}

const targetStack = []
export function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
