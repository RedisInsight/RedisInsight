import React from 'react'
import { useSelector } from 'react-redux'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'

import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { RootState } from 'uiSrc/slices/store'
import { KeyTypes } from 'uiSrc/constants'
import BulkActions, { Props } from './BulkActions'

const mockedProps = {
  ...mock<Props>(),
}

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  selectedBulkActionsSelector: jest.fn().mockReturnValue({
    type: 'delete'
  }),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

beforeEach(() => {
  const state: any = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    browser: {
      ...state.browser,
      keys: {
        ...state.browser.keys,
      }
    }
  }))
})

describe('BulkActions', () => {
  it('should render', () => {
    expect(render(<BulkActions {...mockedProps} />)).toBeTruthy()
  })

  it('placeholder should render', () => {
    render(<BulkActions {...mockedProps} />)

    expect(screen.queryByTestId('bulk-actions-placeholder')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-actions-summary')).not.toBeInTheDocument()
  })

  it('bulk actions summary should render with any search', () => {
    const state: any = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: any) => any) => callback({
      ...state,
      browser: {
        ...state.browser,
        keys: {
          ...state.browser.keys,
          search: '1',
        }
      }
    }))

    render(<BulkActions {...mockedProps} />)

    expect(screen.queryByTestId('bulk-actions-summary')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-actions-placeholder')).not.toBeInTheDocument()
  })

  it('bulk actions summary should render with any filter', () => {
    const state: any = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: any) => any) => callback({
      ...state,
      browser: {
        ...state.browser,
        keys: {
          ...state.browser.keys,
          filter: KeyTypes.Hash,
        }
      }
    }))

    render(<BulkActions {...mockedProps} />)

    expect(screen.queryByTestId('bulk-actions-summary')).toBeInTheDocument()
    expect(screen.queryByTestId('bulk-actions-placeholder')).not.toBeInTheDocument()
  })
})
