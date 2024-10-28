import { visit } from 'unist-util-visit'
import { remarkSanitize } from 'uiSrc/utils/formatters/markdown'

jest.mock('unist-util-visit')

const testCases = [
  { input: '', output: '' },
  { input: '<a href="https://localhost">', output: '<a href="https://localhost" target="_blank">' },
  { input: '<a href="/settings">', output: '<a>' },
  { input: '<a href="javascript:alert(1)">', output: '<a>' },
  { input: '<img onload="alert(1)">', output: '<img>' },
  { input: '<img src="javascript:alert(1)">', output: '<img>' },
  { input: '<img src="img.png">', output: '<img src="img.png">' },
  { input: '<div dangerouslySetInnerHTML={{"__html": "<img src=x onerror=alert(\'this.still.works\')>"}} />', output: '' },
  { input: '<script>', output: '' },
  { input: '<script>alert(1)</script>', output: '' },
]

describe('remarkSanitize', () => {
  testCases.forEach((tc) => {
    it('should return proper sanitized value', () => {
      const node = {
        value: tc.input
      };

      // mock implementation
      (visit as jest.Mock)
        .mockImplementation((_tree: any, _name: string, callback: (node: any) => void) => { callback(node) })

      const remark = remarkSanitize()
      remark({} as Node)
      expect(node).toEqual({
        ...node,
        value: tc.output,
      })
    })
  })
})
