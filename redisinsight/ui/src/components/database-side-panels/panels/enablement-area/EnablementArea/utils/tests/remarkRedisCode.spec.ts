import { visit } from 'unist-util-visit'
import { remarkRedisCode } from '../transform/remarkRedisCode'

jest.mock('unist-util-visit')

const getValue = (meta: string, params?: string, value?: string) =>
  `<Code label="${meta}" params="${params}" path={path}>{${JSON.stringify(value)}}</Code>`

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
      value: getValue(codeNode.meta, undefined, '1')
    })
  })

  describe('should properly modify codeNode with lang redis', () => {
    it('with auto execute param redis:[auto=true;results=group]', () => {
      const paramsWithAuto = '[auto=true;results=group]'
      const codeNode = {
        lang: `redis:${paramsWithAuto}`,
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
        value: getValue(codeNode.meta, paramsWithAuto, `${paramsWithAuto}\n1`)
      })
    })
    it('without auto execute param redis:[results=group;pipeline=2]', () => {
      const paramsWithoutAuto = '[results=group;pipeline=2]'
      const codeNode = {
        lang: `redis:${paramsWithoutAuto}`,
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
        value: getValue(codeNode.meta, paramsWithoutAuto, `${paramsWithoutAuto}\n1`)
      })
    })
  })
})
