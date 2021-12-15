import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

import { IFormatter } from './formatter.interfaces'

class MarkdownToJsxString implements IFormatter {
  format(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      unified()
        .use(remarkParse)
        .use(MarkdownToJsxString.remarkRedisCode)
        .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
        .use(MarkdownToJsxString.rehypeExternalLinks) // Set External links
        .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings
        .process(data)
        .then((file) => {
          resolve(String(file))
        })
        .catch((error) => reject(error))
    })
  }

  private static remarkRedisCode(): (tree: Node) => void {
    return (tree: any) => {
      // Find code node in syntax tree
      visit(tree, 'code', (codeNode) => {
        const { value, meta, lang } = codeNode
        // Check that it has a language unsupported by our editor
        if (lang === 'redis') {
          codeNode.type = 'html'
          // Replace it with our custom component
          codeNode.value = `<Code label="${meta}" >{${JSON.stringify(value)}}</Code>`
        }
      })
    }
  }

  private static rehypeExternalLinks(): (tree: Node) => void {
    return (tree: any) => {
      visit(tree, 'element', (node) => {
        if (node.tagName === 'a' && node.properties && typeof node.properties.href === 'string') {
          const url = node.properties.href
          if (IS_ABSOLUTE_PATH.test(url)) {
            node.properties.rel = ['nofollow', 'noopener', 'noreferrer']
            node.properties.target = '_blank'
          }
        }
      })
    }
  }
}

export default MarkdownToJsxString
