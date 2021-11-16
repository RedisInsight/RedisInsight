import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  clearStoreActions,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { setSearchMatch } from 'uiSrc/slices/keys'
import SearchKeyList, { Props } from './SearchKeyList'

const mockedProps = mock<Props>()
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SearchKeyList', () => {
  it('should render', () => {
    expect(render(<SearchKeyList {...instance(mockedProps)} />)).toBeTruthy()
    const searchInput = screen.getByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })

  it('"setSearchMatch" should be called after "onChange"', () => {
    const searchTerm = 'a'

    render(<SearchKeyList {...instance(mockedProps)} />)

    fireEvent.change(screen.getByTestId('search-key'), {
      target: { value: searchTerm },
    })

    const expectedActions = [setSearchMatch(searchTerm)]

    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
