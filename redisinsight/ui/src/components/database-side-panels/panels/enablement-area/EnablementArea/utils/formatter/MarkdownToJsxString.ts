import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'

import { IFormatter, IFormatterConfig } from './formatter.interfaces'
import { rehypeLinks } from '../transform/rehypeLinks'
import { remarkRedisUpload } from '../transform/remarkRedisUpload'
import { remarkRedisCode } from '../transform/remarkRedisCode'
import { remarkImage } from '../transform/remarkImage'
import { remarkLink } from '../transform/remarkLink'

class MarkdownToJsxString implements IFormatter {
  format(input: any, config?: IFormatterConfig): Promise<string> {
    const { data, path } = input
    return new Promise((resolve, reject) => {
      unified()
        .use(remarkParse)
        .use(remarkGfm) // support GitHub Flavored Markdown
        .use(remarkRedisUpload, path) // Add custom component for redis-upload code block
        .use(remarkRedisCode) // Add custom component for Redis code block
        .use(remarkImage, path) // Add custom component for Redis code block
        .use(remarkLink) // Customise links
        .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
        .use(rehypeLinks, config ? { history: config.history } : undefined) // Customise links
        .use(MarkdownToJsxString.rehypeWrapSymbols) // Wrap special symbols inside curly braces for JSX parse
        .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings
        .process(data)
        .then((file) => {
          resolve(String(file))
        })
        .catch((error) => reject(error))
    })
  }

  private static rehypeWrapSymbols(symbols: string[] = ['{', '}', '>']): (tree: Node) => void {
    return (tree: any) => {
      visit(tree, 'text', (node) => {
        const { value } = node
        if (value) {
          node.value = value.replace(new RegExp(`[${symbols.join()}]`, 'g'), '{"$&"}')
        }
      })
    }
  }
}

export default MarkdownToJsxString
