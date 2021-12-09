import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import { IFormatter } from './formatter.interfaces'

class MarkdownToJsxString implements IFormatter {
  format(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      unified()
        .use(remarkParse)
        .use(MarkdownToJsxString.remarkRedisCode)
        .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
        .use(rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }) // Set External links
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
}

export default MarkdownToJsxString
