import { isNil, isUnaryTag } from '../utils.js'
const vDirectReg = /^(v-)(.*?)(:)/ // 匹配v-?:
const vModelReg = /^v-model(.*)/ // 匹配v-model="value"
const vBindReg = /^(v-bind:|:)(.*?)/ // 匹配 v-bind:title 和 :title
const vOnReg = /^(v-on:|@)(.*?)/ // 匹配 v-on:click 和 @click
const vSlotReg = /(v-slot:|v-slot=|#)(.*)/ // 匹配v-slot:default和#header

// 生成ast节点
const generaToAstElement = ({ tag, rawAttr, rawAttrStr }) => {
  return {
    type: 1, // 元素节点类型,dom节点默认为1,文本节点为4
    tag, // 标签名
    rawAttr, // 原始属性对象
    rawAttrStr, // 原始属性文本
    children: [], // 子节点
    parent: null, // 父节点
  }
}

// 生成ast文本节点
const generaTextAst = (text) => {
  return {
    type: 3,
    text,
  }
}
// 根据attr字符串生成attr属性对象
const generaAttrObj = (rawAttrStr) => {
  if (rawAttrStr.trim() === '') {
    return {}
  }
  const list = (rawAttrStr + ' ')
    .split('" ')
    .filter((i) => i)
    .map((str) => str + '"')
  const obj = list.reduce((p, c) => {
    const [name, value] = c.split('=')

    if (value.slice(1, -1) === '' && vSlotReg.test(name)) {
      const [slot, slotBindKey, slotName] = name.match(vSlotReg)
      return {
        ...p,
        ['v-slot']: slotName,
      }
    }

    return {
      ...p,
      [name]: value.slice(1, -1), // 移除多余的双引号
    }
  }, {})
  return obj
}

/*
 * 处理属性上的v-model双向绑定
 * 将处理结果放置到 curPop.attrs 的 VModel 上
 * 使用场景
 * <select v-model="xx"></select>
 * <input type="text" v-model="xx"></input>
 * <input type="checkbox" v-model="xx"></input>
 */
const processVModel = (element) => {
  const { rawAttr, tag } = element
  const { 'v-model': vModelValue, type } = rawAttr
  let vModel = {}
  if (tag === 'input') {
    if (/text/.test(type)) {
      // type='"text"'
      vModel = {
        tag,
        type: 'text',
        value: vModelValue,
      }
    }
    if (/checkbox/.test(type)) {
      // type='"checkbox"'
      vModel = {
        tag,
        type: 'checkbox',
        value: vModelValue,
      }
    }
  } else if (tag === 'textarea') {
    vModel = {
      tag,
      type: 'textarea',
      value: vModelValue,
    }
  } else if (tag === 'select') {
    vModel = {
      tag,
      value: vModelValue,
    }
  }

  element.attrs.vModel = vModel
}

/**处理属性上的v-bind
 * <div v-bind:style="xxx" v-bind:id="xxx"></div>
 */
const processVBind = ({ element, key, value }) => {
  const processKey = key.replace(vBindReg, '')
  element.attrs.vBind = {
    ...(element.attrs.vBind ?? {}),
    [processKey]: value,
  }
}

/**
 *
 * 处理属性上的v-on
 * <div v-on:click="" @touchmove=""></div>
 */
const processVOn = ({ element, key, value }) => {
  const processKey = key.replace(vOnReg, '')
  element.attrs.vOn = {
    ...(element.attrs.vOn ?? {}),
    [processKey]: value,
  }
}

const processElementAttr = (element) => {
  const { rawAttr = {} } = element
  element.attrs = {}
  for (let key in rawAttr) {
    if (vModelReg.test(key)) {
      processVModel(element)
    } else if (vBindReg.test(key)) {
      processVBind({
        element,
        key,
        value: rawAttr[key],
      })
    } else if (vOnReg.test(key)) {
      processVOn({
        element,
        key,
        value: rawAttr[key],
      })
    } else if (!vDirectReg.test(key)) {
      element.attrs[key] = rawAttr[key]
    }
  }
}

const processSlotContent = (element) => {
  const { tag, rawAttr } = element
  if (tag === 'template') {
    for (const key in rawAttr) {
      if (/^(v-slot)(.*)/.test(key)) {
        const slotValue = rawAttr[key]
        element.scopeSlot = slotValue
      }
    }
  }
}

export function parseStrToAst(templateStr) {
  let root = null // 根节点
  let html = templateStr // 备份
  const stack = [] // 存放元素的栈

  // 开始标签
  const parseStartTag = () => {
    const startIndex = 1
    const endIndex = html.indexOf('>')
    const tagContent = html.slice(startIndex, endIndex)
    const tagContentArray = tagContent.split(' ')
    const tagName = tagContentArray.shift()
    const rawAttrStr = tagContentArray.join(' ')
    const attrsObj = generaAttrObj(rawAttrStr)
    const element = generaToAstElement({
      tag: tagName,
      rawAttr: attrsObj,
      rawAttrStr,
    })

    // 初始节点设置为根节点
    if (isNil(root)) {
      root = element
    }

    // 父级入栈
    stack.push(element)
    html = html.slice(endIndex + 1)
    if (isUnaryTag(tagName)) {
      processElement()
    }
  }

  // 结束标签
  const parseEndTag = () => {
    const endIndex = html.indexOf('>')
    html = html.slice(endIndex + 1)
    processElement()
  }

  // dom节点文本内容
  const parseText = () => {
    const endIndex = html.indexOf('<')
    const text = html.slice(0, endIndex)?.trim()
    if (isNil(text) || text === '') {
      return
    }

    // 若栈顶有元素，直接判定此文本为该元素的子元素
    if (stack.length) {
      const parent = stack[stack.length - 1]
      let copyText = text
      // 文本段可能存在{{name}}normal text {{second}}这样的情况，故需要遍历生成文本节点
      while (copyText.trim()) {
        const expressionStartIndex = copyText.indexOf('{{')
        if (expressionStartIndex > 0) {
          const subText = copyText.slice(0, expressionStartIndex)
          copyText = copyText.slice(expressionStartIndex)
          const textElement = generaTextAst(subText)
          parent.children.push(textElement)
        } else if (expressionStartIndex === 0) {
          const expressionEndIndex = copyText.indexOf('}}') + 2
          const subText = copyText.slice(0, expressionEndIndex)
          copyText = copyText.slice(expressionEndIndex)
          const textElement = generaTextAst(subText)
          const [, expression] = subText.match(/{{(.*)}}/)
          textElement.expression = expression
          parent.children.push(textElement)
        } else if (expressionStartIndex === -1) {
          const textElement = generaTextAst(copyText)
          copyText = ''
          parent.children.push(textElement)
        }
      }
    }

    html = html.slice(endIndex)
  }

  // 处理标签结束,主要行为是处理v-model,v-on,v-bind这些属性及插槽
  const processElement = () => {
    // 出栈，拿到当前节点
    const element = stack.pop()
    // 处理节点属性
    processElementAttr(element)
    // 处理节点插槽
    processSlotContent(element)
    // 与父节点关联
    if (stack.length) {
      const parent = stack[stack.length - 1]
      element.parent = parent
      parent.children.push(element)

      // 绑定插槽与父级节点
      if (element.scopeSlot) {
        const { scopeSlot, children, parent } = element
        const slotInfo = {
          scopeSlot,
          children: children.map((item) => {
            delete item.parent
            return item
          }),
        }
        parent.rawAttr.scopedSlots = {
          ...(parent.rawAttr.scopedSlots ?? {}),
          [scopeSlot]: slotInfo,
        }
      }
    }
  }

  while ((html = html.trim())) {
    // 匹配注释，删除
    const nodeStartIndex = html.indexOf('<!--')
    if (nodeStartIndex === 0) {
      const nodeEndIndex = html.indexOf('-->')
      html = html.slice(nodeEndIndex + 3)
    }

    const startIndex = html.indexOf('<')
    // 匹配到节点标签<
    if (startIndex === 0) {
      if (html.indexOf('</') !== 0) {
        parseStartTag()
      } else {
        parseEndTag()
      }
    } else if (startIndex > 0) {
      parseText()
    }
  }

  return root
}
