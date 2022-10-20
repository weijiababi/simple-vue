import { isNil, isUnaryTag } from '../utils.js'
const vModelReg = /v-model(.*?)/ // 匹配  v-model="value"
const vBindReg = /^(v-bind:|:)(.*?)/ // 匹配 v-bind:title 和 :title
const vOnReg = /^(v-on:|@)(.*?)/ // 匹配 v-on:click 和 @click

// 将属性字符串转为属性obj
const generaAttrObj = (attrsContent) => {
  const splitted = attrsContent.split('" ') // '" '是属性分隔符，切分出后需要给多切的'"'补充回去
  const attrsArray = splitted.map((v, i) => {
    if (i === splitted.length - 1) {
      return v
    }
    return v + '"'
  })
  const obj = attrsArray.reduce((p, c) => {
    const [name, value] = c.split('=')
    return {
      ...p,
      [name]: value.slice(1, -1), // 用slice移除多余的引号, 不可使用reg replace(/"|'/g, '')匹配删除,因为可能遇上:bind="'count'"常量字符串及:bind="count"变量的情况
    }
  }, {})
  return obj
}
// 生成ast节点
const generaToAst = (tag, attrsObj) => {
  return {
    // 元素节点类型
    type: 1,
    // 标签名
    tag,
    // 原始属性对象
    rawAttr: attrsObj,
    // 子节点
    children: [],
    // 父节点
    parent: [],
  }
}
// 生成ast文本节点
const generaTextAst = (text) => {
  return {
    type: 3,
    text,
  }
}
// 处理节点结束
// 主要行为是处理v-model,v-on,v-bind这些属性及插槽
const processElement = (stack) => {
  // 出栈，拿到当前遍历原始节点
  const rawElement = stack.pop()
  // 处理节点属性
  processElementAttr(rawElement)

  const arrlen = stack.length
  if (arrlen > 0) {
    stack[arrlen - 1].children.push(rawElement)
  }
}

// 处理节点绑定的各个属性及行为
const processElementAttr = (current) => {
  current.attrs = {}
  const { rawAttr } = current

  for (const key in rawAttr) {
    if (vModelReg.test(key)) {
      processVModel(current)
    } else if (vBindReg.test(key)) {
      processVBind(current, key, rawAttr[key])
    } else if (vOnReg.test(key)) {
      processVOn(current, key, rawAttr[key])
      // 普通属性，直接赋值
    } else {
      current.attrs[key] = rawAttr[key]
    }
  }
}

/*
 * 处理属性上的v-model双向绑定
 * 将处理结果放置到 curPop.attrs 的 VModel 上
 * 使用场景
 * <select v-model="xx"></select>
 * <input type="text" v-model="xx"></input>
 * <input type="checkbox" v-model="xx"></input>
 */
const processVModel = (current) => {
  const { tag, rawAttr } = current
  const { type, 'v-model': vModelValue } = rawAttr
  let vModel = {}
  if (tag === 'input') {
    if (/text/.test(type)) {
      vModel = { tag, type: 'text', value: vModelValue }
    }
    if (/checkbox/.test(type)) {
      vModel = { tag, type: 'checkbox', value: vModelValue }
    }
  } else if (tag === 'textarea') {
    vModel = { tag, type: 'textarea', value: vModelValue }
  } else if (tag === 'select') {
    vModel = { tag, value: vModelValue }
  }

  current.attrs.vModel = vModel
}

/**处理属性上的v-bind
 * <div v-bind:style="xxx" v-bind:id="xxx"></div>
 */
const processVBind = (current, key, value) => {
  const processKey = key.replace(vBindReg, '')
  current.attrs.vBind = {
    ...(current.attrs.vBind ?? {}),
    [processKey]: value,
  }
}

/**
 *
 * 处理属性上的v-on
 * <div v-on:click="" @touchmove=""></div>
 */
const processVOn = (current, key, value) => {
  const processKey = key.replace(vOnReg, '')
  current.attrs.vOn = {
    ...(current.attrs.vOn ?? {}),
    [processKey]: value,
  }
}

export function parseAstToStr(templateStr) {
  let root = null // 最终输出结果
  let html = templateStr // 备份输入，避免直接修改影响到
  const stack = [] // 存放元素的栈

  // 处理开始标签
  const parseStartTag = () => {
    const tagStartIndex = 1
    const tagEndIndex = html.indexOf('>')
    const tagContent = html.slice(tagStartIndex, tagEndIndex)
    const tagContentArray = tagContent.split(' ') // 标签名及属性是以空格为间隔的
    const tagName = tagContentArray.shift() // 分离出标签名
    const attrsObj = generaAttrObj(tagContentArray.join(' '))
    const elementAst = generaToAst(tagName, attrsObj)

    if (isNil(root)) {
      root = elementAst
    }
    // 将处理的ast对象插入stack栈中
    stack.push(elementAst)
    // 处理完成，截断已处理部分字符串
    html = html.slice(tagEndIndex + 1)
    // 如果是闭合标签，则直接处理结束
    if (isUnaryTag(tagName)) {
      processElement(stack)
    }
  }

  // 处理结束标签
  const parseEndTag = () => {
    const tagEndIndex = html.indexOf('>')
    html = html.slice(tagEndIndex + 1)

    processElement(stack)
  }

  // 处理文本
  const parseText = () => {
    const nextTagIndex = html.indexOf('<')
    let text = html.slice(0, nextTagIndex)
    text = text.trim()
    // 若文本为空，则不做处理
    if (text === '' || isNil(text)) {
      return
    }
    // 若栈顶有元素，可判断该元素为栈顶element的children
    if (stack.length) {
      const textAst = generaTextAst(text)
      const popElement = stack[stack.length - 1]
      popElement.children.push(textAst)
    }
    html = html.slice(nextTagIndex)
  }

  while ((html = html.trim())) {
    const startIndex = html.indexOf('<')
    // 匹配到标签符号，判断为开始标签<div>或者结束标签</div>
    if (startIndex === 0) {
      // 结束标签
      if (html.indexOf('</') === 0) {
        parseEndTag()
        // 开始标签
      } else {
        parseStartTag()
      }
      // 内容部分<div>内容内容内容</div>
    } else if (startIndex > 0) {
      parseText()
    }
  }

  return root
}
