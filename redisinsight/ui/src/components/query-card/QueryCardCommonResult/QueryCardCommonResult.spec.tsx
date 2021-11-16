import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import QueryCardCommonResult, { Props } from './QueryCardCommonResult'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('QueryCardCliResult', () => {
  it('should render', () => {
    expect(render(<QueryCardCommonResult {...instance(mockedProps)} />)).toBeTruthy()
  })
})
