export function isNil(value) {
  return value === undefined || value === null
}

/**
 * 是否为自闭合标签
 */
export function isUnaryTag(tagName) {
  return ['input', 'img'].includes(tagName)
}

/**
 * 是否为平台保留节点
 */
export function isReserveTag(tagName) {
  const reserveTag = [
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'span',
    'input',
    'select',
    'option',
    'p',
    'button',
    'template',
  ]
  return reserveTag.includes(tagName)
}
