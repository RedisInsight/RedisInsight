import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import EncryptionErrorContent from './EncryptionErrorContent'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

/**
 * EncryptionErrorContent tests
 *
 * @group unit
 */
describe('EncryptionErrorContent', () => {
  it('should render', () => {
    expect(render(<EncryptionErrorContent />)).toBeTruthy()
  })
})
