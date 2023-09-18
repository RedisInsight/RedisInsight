/* eslint-disable sonarjs/no-identical-functions */
import React from 'react'
import { cloneDeep } from 'lodash'
import { useSelector } from 'react-redux'
import { render, screen, fireEvent, mockedStore, cleanup, act, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { RootState } from 'uiSrc/slices/store'
import { toggleBrowserFullScreen } from 'uiSrc/slices/browser/keys'
import BrowserPage from './BrowserPage'
import KeyList, { Props as KeyListProps } from './components/key-list/KeyList'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

jest.mock('./components/key-list/KeyList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const unprintableStringBuffer = {
  type: 'Buffer',
  data: [172, 237, 0]
}

const mockKeyList = (props: KeyListProps) => (
  <div>
    <button
      type="button"
      data-testid="loadMoreItems-btn"
      onClick={() => props?.handleScanMoreClick?.({ startIndex: 1, stopIndex: 2 })}
    >
      loadMoreItems
    </button>
  </div>
)

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const selectKey = (state: any, selectedKey: any, data?: any = {}) => {
  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    app: {
      ...state.app,
      context: {
        ...state.app.context,
        browser: {
          ...state.app.context.browser,
          bulkActions: {
            opened: false
          },
          keyList: {
            ...state.app.context.keyList,
            isDataLoaded: true,
            selectedKey,
          },
        }
      }
    },

    browser: {
      ...state.browser,
      ...data,
      keys: {
        ...state.browser.keys,
        selectedKey,
      },
    }
  }))
}

/**
 * BrowserPage tests
 *
 * @group component
 */

describe('KeyDetailsHeader', () => {
  beforeAll(() => {
    KeyList.mockImplementation(mockKeyList)
  })

  beforeEach(() => {
    const state: any = store.getState()

    // key with unprintable characters
    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.Hash,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    selectKey(state, selectedKey)
  })

  it('Verify that user cannot rename key name with unprintable characters and check tooltip', async () => {
    const { queryByTestId } = render(<BrowserPage />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId(/edit-key-btn/))

    expect(screen.getByTestId(/edit-key-btn/)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId(/edit-key-input/), { target: { value: 'val123' } })

    expect(queryByTestId('apply-btn')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(/apply-btn/))
    expect(queryByTestId('apply-btn')).toBeDisabled()

    expect(store.getActions()).toEqual([...afterRenderActions])

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('apply-btn'))
    })
    await waitForEuiToolTipVisible()

    expect(screen.queryByTestId('apply-tooltip')).toBeInTheDocument()
  })
})

describe('KeyDetailsWrapper', () => {
  beforeAll(() => {
    KeyList.mockImplementation(mockKeyList)
  })

  beforeEach(() => {
    const state: any = store.getState()

    // key with unprintable characters
    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.Hash,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    selectKey(state, selectedKey)
  })

  it('Verify that user cannot save key value (String) with unprintable characters and check tooltip', async () => {
    const state: any = store.getState()

    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.String,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    // String value with unprintable characters
    const data = {
      string: {
        loading: false,
        error: '',
        data: {
          key: unprintableStringBuffer,
          value: {
            type: 'Buffer',
            data: [172, 237, 0]
          },
        }
      }
    }
    selectKey(state, selectedKey, data)

    const { queryByTestId } = render(<BrowserPage />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId(/string-value/))

    expect(screen.getByTestId(/string-value/)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId(/string-value/), { target: { value: 'val123' } })

    expect(queryByTestId('apply-btn')).toBeInTheDocument()
    expect(queryByTestId('apply-btn')).toBeDisabled()

    expect(store.getActions()).toEqual([...afterRenderActions])

    await act(async () => {
      fireEvent.mouseOver(screen.getByTestId('apply-btn'))
    })
    await waitForEuiToolTipVisible()

    expect(screen.queryByTestId('apply-tooltip')).toBeInTheDocument()
  })

  it('Verify that user cannot save key value (Hash) with unprintable characters', () => {
    const state: any = store.getState()
    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.Hash,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    // Hash value with unprintable characters
    const data = {
      hash: {
        loading: false,
        error: '',
        data: {
          nextCursor: 0,
          match: '*',
          key: unprintableStringBuffer,
          total: 1,
          fields: [{
            value: unprintableStringBuffer,
            field: {
              type: 'Buffer',
              data: [49], // 1
            },
          }]
        },
        updateValue: {
          loading: false
        }
      }
    }
    selectKey(state, selectedKey, data)

    const { queryByTestId } = render(<BrowserPage />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId(/edit-hash-button-1/))

    expect(screen.getByTestId(/hash-value-editor/)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId(/hash-value-editor/), { target: { value: 'val123' } })

    expect(queryByTestId('apply-btn')).toBeInTheDocument()
    expect(queryByTestId('apply-btn')).toBeDisabled()

    expect(store.getActions()).toEqual([...afterRenderActions])
  })

  it('Verify that user cannot save key value (List) with unprintable characters', () => {
    const state: any = store.getState()
    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.List,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    // List value with unprintable characters
    const data = {
      list: {
        loading: false,
        error: '',
        data: {
          count: 0,
          offset: 0,
          key: unprintableStringBuffer,
          total: 1,
          elements: [{
            index: 0,
            element: {
              type: 'Buffer',
              data: [172, 237, 0]
            },
          }]
        },
        updateValue: {
          loading: false
        }
      }
    }
    selectKey(state, selectedKey, data)

    const { queryByTestId } = render(<BrowserPage />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId(/edit-list-button-0/))

    expect(screen.getByTestId(/element-value-editor/)).toBeInTheDocument()
    fireEvent.change(screen.getByTestId(/element-value-editor/), { target: { value: 'val123' } })

    expect(queryByTestId('apply-btn')).toBeInTheDocument()
    expect(queryByTestId('apply-btn')).toBeDisabled()

    expect(store.getActions()).toEqual([...afterRenderActions])
  })
})

describe('back btn', () => {
  beforeAll(() => {
    KeyList.mockImplementation(mockKeyList)
  })

  beforeEach(() => {
    const state: any = store.getState()

    // key with unprintable characters
    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.Hash,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    selectKey(state, selectedKey)
  })

  it('Should call toggleBrowserFullScreen after back btn click', () => {
    const state: any = store.getState()

    const selectedKey = {
      lastRefreshTime: 1664380909470,
      data: {
        name: unprintableStringBuffer,
        type: KeyTypes.String,
        ttl: -1,
        size: 57,
        length: 7,
        nameString: '��',
      }
    }

    // String value with unprintable characters
    const data = {
      string: {
        loading: false,
        error: '',
        data: {
          key: unprintableStringBuffer,
          value: {
            type: 'Buffer',
            data: [172, 237, 0]
          },
        }
      }
    }
    selectKey(state, selectedKey, data)

    render(<BrowserPage />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('back-right-panel-btn'))
    expect(store.getActions()).toEqual([...afterRenderActions, toggleBrowserFullScreen(true)])
  })
})
