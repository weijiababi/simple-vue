export function generate(Ast) {
  const renderStr = generaElement(Ast)
  return new Function(`with(this) {return ${renderStr}}`)
}

function generaElement(ast) {
  const { tag, rawAttr, attrs } = ast
  const attrObj = {
    ...(attrs ?? {}),
  }
  const children = generaChildren(ast)
  return `_c('${tag}', ${JSON.stringify(attrObj)}, [${children}])`
}

function generaChildren(ast) {
  const result = []
  const { children } = ast
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.type === 3) {
      result.push(`_v(${JSON.stringify(child)})`)
    } else if (child.type === 1) {
      result.push(generaElement(child))
    }
  }
  return result
}
