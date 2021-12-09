import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { cleanup, clearStoreActions, mockedEAFormatSelector, mockedStore, render } from 'uiSrc/utils/test-utils'
import { getWBEnablementArea } from 'uiSrc/slices/workbench/wb-enablement-area'
import EnablementAreaWrapper, { Props } from './EnablementAreaWrapper'

const mockedProps = mock<Props>()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/workbench/wb-enablement-area', () => {
  const defaultState = jest.requireActual('uiSrc/slices/workbench/wb-enablement-area').initialState
  return {
    ...jest.requireActual('uiSrc/slices/workbench/wb-enablement-area'),
    workbenchEnablementAreaSelector: jest.fn().mockReturnValue({
      ...defaultState,
    }),
  }
})

jest.mock('./EnablementArea/utils/formatter/FormatSelector', () => {
  return mockedEAFormatSelector
})

describe('EnablementAreaWrapper', () => {
  it('should render and call getWBEnablementArea action', () => {
    const expectedActions = [getWBEnablementArea()]

    expect(render(<EnablementAreaWrapper {...instance(mockedProps)} />)).toBeTruthy()
    expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
