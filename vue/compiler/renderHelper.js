// 根据标签信息创建vnode
export function createElement(tag, attr, children) {
  return new VNODE(tag, attr, children, this)
}
// 生成文本vnode
export function createTextNode(textAst) {
  return new VNODE(null, null, null, this, textAst)
}

class VNODE {
  constructor(tag, attr, children, context, text = null) {
    this.tag = tag
    this.attr = attr
    this.children = children
    this.context = context
    this.text = text
  }
}
