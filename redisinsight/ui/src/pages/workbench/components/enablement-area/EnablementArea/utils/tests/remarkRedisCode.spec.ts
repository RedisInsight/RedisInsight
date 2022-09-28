import { ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { visit } from 'unist-util-visit'
import { remarkRedisCode } from '../remarkRedisCode'

jest.mock('unist-util-visit')

const getValue = (meta: string, execute = ExecuteButtonMode.Manual, params?: string, value?: string) =>
  `<Code label="${meta}" params="${params}" execute="${execute}">{${JSON.stringify(value)}}</Code>`

describe('remarkRedisCode', () => {
  it('should not modify codeNode if lang not redis', () => {
    const codeNode = {
      lang: 'html',
      value: '1',
      meta: '2'
    };
    // mock implementation
    (visit as jest.Mock)
      .mockImplementation((_tree: any, _name: string, callback: (codeNode: any) => void) => { callback(codeNode) })

    const remark = remarkRedisCode()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode
    })
  })

  it('should properly modify codeNode with lang redis', () => {
    const codeNode = {
      lang: 'redis',
      value: '1',
      meta: '2'
    };
    // mock implementation
    (visit as jest.Mock)
      .mockImplementation((_tree: any, _name: string, callback: (codeNode: any) => void) => { callback(codeNode) })

    const remark = remarkRedisCode()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
      type: 'html',
      value: getValue(codeNode.meta, ExecuteButtonMode.Manual, undefined, '1')
    })
  })

  it('should properly modify codeNode with lang redis-auto', () => {
    const codeNode = {
      lang: 'redis-auto',
      value: '1',
      meta: '2'
    };
    // mock implementation
    (visit as jest.Mock)
      .mockImplementation((_tree: any, _name: string, callback: (codeNode: any) => void) => { callback(codeNode) })

    const remark = remarkRedisCode()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
      type: 'html',
      value: getValue(codeNode.meta, ExecuteButtonMode.Auto, undefined, '1')
    })
  })
})
