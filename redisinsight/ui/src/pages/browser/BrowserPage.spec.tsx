/* eslint-disable sonarjs/no-identical-functions */
import React from 'react'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'
import { setConnectedInstanceId } from 'uiSrc/slices/instances'
import { loadKeys, resetKeyInfo } from 'uiSrc/slices/keys'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { cloneDeep } from 'lodash'
import BrowserPage from './BrowserPage'
import KeyList, { Props as KeyListProps } from './components/key-list/KeyList'
import KeyDetailsWrapper, {
  Props as KeyDetailsWrapperProps
} from './components/key-details/KeyDetailsWrapper'
import AddKey, { Props as AddKeyProps } from './components/add-key/AddKey'

jest.mock('./components/key-list/KeyList', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('./components/add-key/AddKey', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

jest.mock('./components/key-details/KeyDetailsWrapper', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockKeyList = (props: KeyListProps) => (
  <div>
    <button
      type="button"
      data-testid="handleAddKeyPanel-btn"
      onClick={() => props.handleAddKeyPanel(true)}
    >
      handleAddKeyPanel
    </button>
    <button
      type="button"
      data-testid="loadMoreItems-btn"
      onClick={() => props.loadMoreItems({ startIndex: 1, stopIndex: 2 })}
    >
      loadMoreItems
    </button>
  </div>
)

const mockKeyDetailsWrapper = (props: KeyDetailsWrapperProps) => (
  <div>
    <button type="button" data-testid="onCloseKey-btn" onClick={() => props.onCloseKey()}>onCloseKey</button>
  </div>
)

const mockAddKey = (props: AddKeyProps) => (
  <div>
    <button type="button" data-testid="handleCloseKey-btn" onClick={() => props.handleCloseKey()}>handleCloseKey</button>
  </div>
)

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('BrowserPage', () => {
  beforeAll(() => {
    KeyList.mockImplementation(mockKeyList)
    KeyDetailsWrapper.mockImplementation(mockKeyDetailsWrapper)
    AddKey.mockImplementation(mockAddKey)
  })

  it('should render', () => {
    expect(render(<BrowserPage />)).toBeTruthy()
    const afterRenderActions = [resetErrors(), setConnectedInstanceId('instanceId'), loadKeys()]
    expect(store.getActions().slice(0, afterRenderActions.length)).toEqual([...afterRenderActions])
  })

  it('should call handleAddKeyPanel', () => {
    render(<BrowserPage />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('handleAddKeyPanel-btn'))

    const expectedActions = [resetKeyInfo()]
    expect(store.getActions()).toEqual([...afterRenderActions, ...expectedActions])
  })

  it('should call loadMoreItems without nextCursor', () => {
    render(<BrowserPage />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('loadMoreItems-btn'))

    expect(store.getActions()).toEqual([...afterRenderActions])
  })

  it('should call onCloseKey', () => {
    render(<BrowserPage />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('onCloseKey-btn'))

    expect(store.getActions()).toEqual([...afterRenderActions, resetKeyInfo()])
  })
})
