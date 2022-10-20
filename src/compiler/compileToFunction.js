import { parseAstToStr } from './parseAstToStr.js'
export default function compileToFunction(templateStr) {
  const ast = parseAstToStr(templateStr)
  console.log(ast)
}
