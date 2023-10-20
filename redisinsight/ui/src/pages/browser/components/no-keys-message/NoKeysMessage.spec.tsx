import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import NoKeysMessage, { Props } from './NoKeysMessage'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NoKeysMessage', () => {
  it('should render', () => {
    expect(render(<NoKeysMessage {...mockedProps} />)).toBeTruthy()
  })
})
