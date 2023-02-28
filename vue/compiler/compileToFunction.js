import { generate } from './generate.js'
import { parseStrToAst } from './parseStrToAst.js'

export default function compileToFunction(templateStr) {
  // 将模板字符串编译为 ast 树结构
  const Ast = parseStrToAst(templateStr)
  // 生成真正的渲染函数
  const render = generate(Ast)
  return render
}
