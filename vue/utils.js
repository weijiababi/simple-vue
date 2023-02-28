export function isNil(c) {
  return c === undefined || c === null
}

// 判断是否为闭合标签
export function isUnaryTag(tagName) {
  return ['input', 'img'].includes(tagName)
}

export const JSToCSS = (JS) => {
  let cssString = ''
  for (let objectKey in JS) {
    cssString +=
      objectKey.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`) +
      ': ' +
      JS[objectKey] +
      ';\n'
  }

  return cssString
}
