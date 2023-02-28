import { isNil } from '../utils'

/**
 * 初始渲染和后续更新的入口
 * @param {VNode} oldVnode 老的 VNode
 * @param {VNode} vnode 新的 VNode
 * @returns VNode 的真实 DOM 节点
 */
export function patch({ oldVNode, VNode }) {
  // 老节点存在，新节点不存在，销毁了
  if (oldVNode && !VNode) {
    return null
  }

  // 无旧节点，说明是新节点，直接创建
  if (!oldVNode) {
    createEle({
      VNode,
      parent: null,
      referNode: null,
    })
    // 存在旧节点，执行比对
  } else {
    // 若存在nodeType,说明此时oldVNode是真实dom,就渲染vnode并替换这个真实dom
    if (oldVNode.nodeType) {
      // 父节点
      const parent = oldVNode.parentNode
      // 参考节点，即oldVNode的下一个节点
      const referNode = oldVNode.nextSibling
      // 创建元素,将VNode转为真实节点，并添加到父节点
      createEle({
        VNode,
        parent,
        referNode,
      })
      parent.removeChild(oldVNode)
    } else {
      // 比对前后两个新旧的vnode
      patchVNode({
        oldVNode,
        VNode,
      })
    }
  }
  return VNode.elm
}

export function patchVNode({ oldVNode, VNode }) {
  // 文本比对
  if (oldVNode === VNode) {
    return
  }

  VNode.elm = oldVNode.elm
  const newChild = VNode.children
  const oldChild = oldVNode.children

  if (VNode.text) {
    const oldTextContent = oldVNode.elm.textContent
    let newTextValue = VNode.text.expression
      ? String(VNode.context[VNode.text.expression])
      : String(VNode.text.text)

    if (oldTextContent !== newTextValue) {
      oldVNode.elm.textContent = newTextValue
    }
  } else {
    // 更新节点原有属性（class,id,vModel,vOn等）
    setAttribute({ VNode })

    // 新节点有子节点，旧节点无，则新增
    if (newChild && newChild.length && (!oldChild || !oldChild.length)) {
      for (let i = 0; i < newChild.length - 1; i++) {
        createEle({
          VNode: newChild[i],
          parent: VNode.elm,
          referNode: null,
        })
      }
      // 旧节点有子节点，新节点无，则移除
    } else if ((!newChild || !newChild.length) && oldChild && oldChild.length) {
      let nodeList = Array.from(oldChild)
      for (let i = 0; i < nodeList.length; i++) {
        oldVNode.elm.removeChild(nodeList[i])
      }
      // 新旧均不为空数组，则进行子node比对
    } else if (newChild && newChild.length && oldChild && oldChild.length) {
      updateChildren({
        oldChild,
        newChild,
        VNode,
      })
    }
  }
}

export function updateChildren({ oldChild, newChild, VNode }) {
  let newStartIdx = 0
  let newEndIdx = newChild?.length - 1
  let oldStartIdx = 0
  let oldEndIdx = oldChild?.length - 1
  while (newStartIdx <= newEndIdx && oldStartIdx <= oldEndIdx) {
    const newStartNode = newChild[newStartIdx]
    const newEndNode = newChild[newEndIdx]
    const oldStartNode = oldChild[oldStartIdx]
    const oldEndNode = oldChild[oldEndIdx]
    if (someVNode(newStartNode, oldStartNode)) {
      patchVNode({
        oldVNode: oldStartNode,
        VNode: newStartNode,
      })
      newStartIdx++
      oldStartIdx++
    } else if (someVNode(newStartNode, oldEndNode)) {
      patchVNode({
        oldVNode: oldEndNode,
        VNode: newStartNode,
      })
      newStartIdx++
      oldEndIdx--
    } else if (someVNode(newEndNode, oldStartNode)) {
      patchVNode({
        oldVNode: oldStartNode,
        VNode: newEndNode,
      })
      oldStartIdx++
      newEndIdx--
    } else if (someVNode(newEndNode, oldEndNode)) {
      patchVNode({
        oldVNode: oldEndNode,
        VNode: newEndNode,
      })
      oldEndIdx++
      newEndIdx--
    } else {
      // 前后数列不一致，遍历查找
      patchVNode({
        oldVNode: oldStartNode,
        VNode: newStartNode,
      })
      newStartIdx++
      oldStartIdx++
    }
  }
  // 新节点未遍历全部，说明是新节点列表较长，需要将剩余节点添加进去
  if (newStartIdx < newEndIdx) {
    for (let i = newStartIdx; i < newEndIdx; i++) {
      createEle({
        VNode: newChild[i],
        parent: VNode.elm,
        referNode: null,
      })
    }
    // 旧节点未遍历结束，需要将剩余部分移除
  } else if (oldStartIdx < oldEndIdx) {
    let nodeList = Array.from(oldChild)
    for (let i = oldStartIdx; i < oldEndIdx; i++) {
      VNode.elm.removeChild(nodeList[i])
    }
  }
}

/**
 * 创建元素
 * @param {*} vnode VNode
 * @param {*} parent VNode 的父节点，真实节点
 * @param {*} referNode 参考节点
 * @returns
 */
function createEle({ VNode, parent, referNode }) {
  const { text, children = [], tag } = VNode
  if (!isNil(text)) {
    VNode.elm = createTextEle(VNode)
  } else {
    VNode.elm = document.createElement(tag)
    setAttribute({
      VNode,
    })

    for (let i in children) {
      createEle({
        VNode: children[i],
        parent: VNode.elm,
        referNode: null,
      })
    }
  }

  if (!isNil(parent)) {
    if (referNode) {
      parent.insertBefore(VNode.elm, referNode)
    } else {
      parent.appendChild(VNode.elm)
    }
  }
}

function createTextEle(VNode) {
  const { text, context } = VNode
  let node = null
  // 若有expression说明是{{}}形式
  if (text.expression) {
    const value = context[text.expression]
    node = document.createTextNode(value)
  } else {
    node = document.createTextNode(text.text)
  }
  return node
}

function setAttribute({ VNode }) {
  const { attr } = VNode
  for (let name in attr) {
    if (name === 'vOn') {
      setAttrVOn({
        VNode,
      })
    } else if (name === 'vBind') {
      setAttrVBind({
        VNode,
      })
    } else if (name === 'vModel') {
      setAttrVModel({
        VNode,
      })
    } else {
      VNode.elm.setAttribute(name, attr[name])
    }
  }
}

function setAttrVOn({ VNode }) {
  const obj = VNode.attr.vOn
  const context = VNode.context
  for (let key in obj) {
    const callback = context?.[obj[key]] ?? obj[key]
    if (callback && typeof callback === 'function') {
      VNode.elm[`on${key}`] = callback.bind(context)
    }
  }
}

function setAttrVModel({ VNode }) {
  const obj = VNode.attr.vModel
  const { context: vm, elm } = VNode
  const key = obj.value
  const value = vm[key]

  if (obj.tag === 'input') {
    if (obj.type === 'text') {
      elm.value = value
      elm.addEventListener('input', () => {
        vm[key] = elm.value
      })
    } else if (obj.type === 'checkbox') {
      elm.setAttribute('value', value)
      elm.addEventListener('change', () => {
        vm[key] = elm.value
      })
    }
  } else if (obj.tag === 'textarea') {
    elm.setAttribute('value', value)
    elm.addEventListener('input', () => {
      vm[key] = elm.value
    })
  } else if (obj.tag === 'select') {
    Promise.resolve().then(() => {
      elm.value = value
      elm.addEventListener('change', () => {
        vm[key] = elm.value
      })
    })
  }
}

function setAttrVBind({ VNode }) {
  const obj = VNode.attr.vBind
  const { context: vm, elm } = VNode
  for (let key in obj) {
    let value = null
    const originValue = obj[key]

    if (typeof originValue === 'string' && /^(')(.*?)(')/.test(originValue)) {
      value = originValue?.slice(1, -1)
    } else {
      value = vm[obj[key]] ?? originValue
    }
    elm.setAttribute(key, value)
  }
}

/**
 * 判断两个节点是否是同一个
 */
function someVNode(a, b) {
  return a.key === b.key && a.tag === b.tag
}
