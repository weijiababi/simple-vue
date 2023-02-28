const queue = [] // watcher队列
let flushing = false // 标记当前watcher队列是否正在刷新
const callbacks = [] // nexttick回调队列
let pengding = false // 标记是否可以添加callback队列

export function queueWatcher(watcher) {
  if (queue.includes(watcher)) {
    return
  }

  if (!flushing) {
    queue.push(watcher)
  } else {
    // watcher正在被刷新处理
    // 当前若watcher存在修改响应式数据的情况，就会出现push进新的watcher，为确保有序，就需要插入合适的位置
    let flag = false
    for (let i = 0; i < queue.length; i++) {
      let cur = queue[i]
      if (watcher._uid > cur._uid) {
        queue.splice(i, 0, watcher)
        flag = true
        break
      }
    }
    // 遍历结束无插入，直接push到末尾
    if (!flag) {
      queue.push(watcher)
    }
  }

  // 当前没有刷新,确保callback队列有一个flushSchedulerQueue
  if (!flushing) {
    nextTick(flushSchedulerQueue)
  }
}

function flushSchedulerQueue() {
  flushing = true
  let item
  while ((item = queue.shift())) {
    item.get()
  }
  flushing = false
}

function flushCallbacks() {
  pengding = false // 当前callback队列进入执行线程，新的callback可以进入处理callback等待队列
  let cb
  while ((cb = callbacks.shift())) {
    cb()
  }
}

// 浏览器异步执行队列
function defer(fn) {
  return Promise.resolve().then(fn)
}

export function nextTick(cb) {
  // 同步任务
  callbacks.push(cb)
  // 将处理队列放入异步任务
  if (!pengding) {
    pengding = true
    defer(flushCallbacks)
  }
}
