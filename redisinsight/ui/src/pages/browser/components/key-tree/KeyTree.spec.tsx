import { cloneDeep } from 'lodash'
import React from 'react'
import {
  cleanup,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import KeyTree from './KeyTree'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const propsMock = {
  keysState: {
    keys: [
      {
        name: 'key1',
        type: 'hash',
        ttl: -1,
        size: 100,
        length: 100,
      },
      {
        name: 'key2',
        type: 'hash',
        ttl: -1,
        size: 150,
        length: 100,
      },
      {
        name: 'key3',
        type: 'hash',
        ttl: -1,
        size: 110,
        length: 100,
      },
    ],
    nextCursor: '0',
    total: 3,
    scanned: 5,
    shardsMeta: {},
    previousResultCount: 1,
    lastRefreshTime: 3
  } as KeysStoreData,
  loading: false,
  selectKey: jest.fn(),
}

const mockWebWorkerResult = [{
  children: [{
    children: [],
    fullName: 'car:110:',
    id: '0.snc1rc3zwgo',
    keyApproximate: 0.01,
    keyCount: 1,
    name: '110',
  }],
  fullName: 'car:',
  id: '0.sz1ie1koqi8',
  keyApproximate: 47.18,
  keyCount: 4718,
  name: 'car',
},
{
  children: [],
  fullName: 'test',
  id: '0.snc1rc3zwg1o',
  keyApproximate: 0.01,
  keyCount: 1,
  name: 'test',
}]

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  useDisposableWebworker: () => ({ result: mockWebWorkerResult, run: jest.fn() }),
}))

describe('KeyTree', () => {
  it.only('Tree view panel should be in the document', () => {
    const { container } = render(<KeyTree {...propsMock} />)

    expect(container.querySelector('[data-test-subj="tree-view-panel"]')).toBeInTheDocument()
  })

  it('Key list panel should be in the document', () => {
    const { container } = render(<KeyTree {...propsMock} />)

    expect(container.querySelector('[data-test-subj="key-list-panel"]')).toBeInTheDocument()
  })
})
