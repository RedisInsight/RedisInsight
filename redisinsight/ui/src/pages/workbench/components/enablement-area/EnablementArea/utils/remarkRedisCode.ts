import { visit } from 'unist-util-visit'
import { ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'

enum ButtonLang {
  Redis = 'redis',
  RedisAuto = 'redis-auto'
}

const PARAMS_SEPARATOR = ':'

export const remarkRedisCode = (): (tree: Node) => void => (tree: any) => {
  // Find code node in syntax tree
  visit(tree, 'code', (codeNode) => {
    const { value, meta, lang } = codeNode

    if (!lang) return

    // Check that it has a language unsupported by our editor
    if (lang.startsWith(ButtonLang.Redis)) {
      const execute = lang.startsWith(ButtonLang.RedisAuto)
        ? ExecuteButtonMode.Auto
        : ExecuteButtonMode.Manual
      const [, params] = lang?.split(PARAMS_SEPARATOR)

      codeNode.type = 'html'
      // Replace it with our custom component
      codeNode.value = `<Code label="${meta}" params="${params}" execute="${execute}">{${JSON.stringify(value)}}</Code>`
    }
  })
}
