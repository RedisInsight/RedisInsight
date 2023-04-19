import { visit } from 'unist-util-visit'
import { remarkRedisUpload } from '../transform/remarkRedisUpload'

jest.mock('unist-util-visit')

const getValue = (label: string, path: string) =>
  `<RedisUploadButton label="${label}" path="${path}" />`

const TUTORIAL_PATH = 'static/custom-tutorials/tutorial-id'

const testCases = [
  {
    value: 'redis-upload:[../../../_data/strings.txt] Upload data',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    label: 'Upload data',
    resultPath: `/${TUTORIAL_PATH}/_data/strings.txt`
  },
  {
    value: 'redis-upload:[/_data/strings.txt] Upload data',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    label: 'Upload data',
    resultPath: `/${TUTORIAL_PATH}/_data/strings.txt`
  },
  {
    value: 'redis-upload:[https://somesite.test/image.png] Upload data',
    path: `${TUTORIAL_PATH}/lvl1/lvl2/lvl3/intro.md`,
    label: 'Upload data',
    resultPath: '/image.png',
  },
]

describe('remarkRedisUpload', () => {
  testCases.forEach((tc) => {
    it(`should return ${tc.resultPath} + ${tc.label} for url:${tc.value}, path: ${tc.path} `, () => {
      const node = {
        type: 'inlineCode',
        value: tc.value,
      };

      // mock implementation
      (visit as jest.Mock)
        .mockImplementation((_tree: any, _name: string, callback: (node: any) => void) => { callback(node) })

      const remark = remarkRedisUpload(tc.path)
      remark({} as Node)
      expect(node).toEqual({
        ...node,
        type: 'html',
        value: getValue(tc.label, tc.resultPath),
      })
    })
  })
})
