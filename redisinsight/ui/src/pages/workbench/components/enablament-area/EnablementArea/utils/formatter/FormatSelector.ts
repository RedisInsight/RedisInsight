import { IFormatter } from './formatter.interfaces'
import MarkdownToJsxString from './MarkdownToJsxString'
import HtmlToJsxString from './HtmlToJsxString'

enum FilesFormat {
  Html = 'html',
  Markdown = 'md'
}

class FormatSelector {
  private static formatters = {
    [FilesFormat.Html]: HtmlToJsxString,
    [FilesFormat.Markdown]: MarkdownToJsxString,
  }

  static selectFor(fileFormat: string): IFormatter {
    const FormatterFactory = FormatSelector.formatters[fileFormat as FilesFormat]
    if (FormatterFactory) {
      return new FormatterFactory()
    }
    throw new Error('Unsupported format')
  }
}

export default FormatSelector
