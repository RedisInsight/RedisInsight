import { visit } from 'unist-util-visit'

enum ButtonLang {
  Redis = 'redis',
}

const PARAMS_SEPARATOR = ':'

export const remarkRedisCode = (): (tree: Node) => void => (tree: any) => {
  // Find code node in syntax tree
  visit(tree, 'code', (codeNode) => {
    const { value, meta, lang } = codeNode

    if (!lang) return

    // Check that it has a language unsupported by our editor
    if (lang.startsWith(ButtonLang.Redis)) {
      const [, params] = lang?.split(PARAMS_SEPARATOR)
      const valueWithParams = params ? `${params}\n${value}` : value

      codeNode.type = 'html'
      // Replace it with our custom component
      // path - binding for JsxParser, it will be replaces as prop value
      codeNode.value = `<Code label="${meta}" params="${params}" path={path}>{${JSON.stringify(valueWithParams)}}</Code>`
    }
  })
}
