import { cloneDeep } from 'lodash'
import React from 'react'
import { keys } from '@elastic/eui'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
} from 'uiSrc/utils/test-utils'
import { loadKeys, loadSearchHistory, setFilter, setPatternSearchMatch } from 'uiSrc/slices/browser/keys'

import SearchKeyList from './SearchKeyList'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSearchHistorySelector: jest.fn().mockReturnValue({
    data: [
      { id: '1', mode: 'pattern', filter: { type: 'list', match: '*' } },
      { id: '2', mode: 'pattern', filter: { type: 'list', match: '*' } },
    ]
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SearchKeyList', () => {
  it('should render', () => {
    expect(render(<SearchKeyList />)).toBeTruthy()
    const searchInput = screen.getByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })

  it('"setSearchMatch" should be called after "onChange"', () => {
    const searchTerm = 'a'

    render(<SearchKeyList />)

    fireEvent.change(screen.getByTestId('search-key'), {
      target: { value: searchTerm },
    })

    fireEvent.keyDown(screen.getByTestId('search-key'), { key: keys.ENTER })

    const expectedActions = [loadSearchHistory(), setPatternSearchMatch(searchTerm), loadKeys()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('should call proper actions after apply suggestion', async () => {
    await act(() => {
      render(<SearchKeyList />)
    })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('show-suggestions-btn'))
    fireEvent.click(screen.getByTestId('suggestion-item-2'))

    const expectedActions = [setFilter('list'), setPatternSearchMatch('*'), loadKeys()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions([...afterRenderActions, ...expectedActions])
    )
  })
})
