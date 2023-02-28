export function update(VNode) {
  const preVNode = this._vnode
  this._vnode = VNode

  // 旧vnode不存在，说明为初次渲染
  if (!preVNode) {
    this.$el = this.__patch__({
      oldVNode: this.$el, // 初始时根节点$el就是#app
      VNode,
    })
  } else {
    // 更新组件或者渲染子组件
    this.$el = this.__patch__({ oldVNode: preVNode, VNode })
  }
}
