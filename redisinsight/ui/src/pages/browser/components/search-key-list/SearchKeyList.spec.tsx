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
} from 'uiSrc/utils/test-utils'
import { loadKeys, setSearchMatch } from 'uiSrc/slices/browser/keys'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import SearchKeyList from './SearchKeyList'

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

    const expectedActions = [setSearchMatch(searchTerm), resetBrowserTree(), loadKeys()]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
