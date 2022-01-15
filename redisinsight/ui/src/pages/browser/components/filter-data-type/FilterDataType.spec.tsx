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
import { loadKeys, setFilter } from 'uiSrc/slices/keys'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances'
import { DataTypes } from 'uiSrc/constants'
import FilterDataType, { Props } from './FilterDataType'

const mockedProps = mock<Props>()
let store: typeof mockedStore

const filterSelectId = 'select-filter-data-type'
const filterInfoId = 'filter-info-popover-icon'

jest.mock('uiSrc/slices/instances', () => ({
  connectedInstanceOverviewSelector: jest.fn().mockReturnValue({
    version: '6.2.1',
  }),
  connectedInstanceSelector: jest.fn().mockReturnValue({ id: '123' }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('FilterDataType', () => {
  it('should render', () => {
    expect(render(<FilterDataType {...instance(mockedProps)} />)).toBeTruthy()
    const searchInput = screen.getByTestId(filterSelectId)
    expect(searchInput).toBeInTheDocument()
  })

  it('should not be disabled filter with database redis version > 6.0', () => {
    render(<FilterDataType {...instance(mockedProps)} />)
    const filterSelect = screen.getByTestId(filterSelectId)

    expect(filterSelect).not.toBeDisabled()
  })

  it('should be info icon with database redis version > 6.0', () => {
    const { queryByTestId } = render(
      <FilterDataType {...instance(mockedProps)} />
    )
    expect(queryByTestId(filterInfoId)).not.toBeInTheDocument()
  })

  it('"setFilter" and "loadKeys" should be called after selecte "Hash" type', () => {
    const { queryByText } = render(
      <FilterDataType {...instance(mockedProps)} />
    )

    fireEvent.click(screen.getByTestId(filterSelectId))
    fireEvent.click(queryByText('Hash') || document)

    const expectedActions = [setFilter(DataTypes.Hash), loadKeys()]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions)
    )
  })

  it('should be disabled filter with database redis version < 6.0', () => {
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))
    render(<FilterDataType {...instance(mockedProps)} />)
    const filterSelect = screen.getByTestId(filterSelectId)

    expect(filterSelect).toBeDisabled()
  })

  it('should be info box with database redis version < 6.0', () => {
    connectedInstanceOverviewSelector.mockImplementation(() => ({
      version: '5.1',
    }))
    render(<FilterDataType {...instance(mockedProps)} />)
    expect(screen.getByTestId(filterInfoId)).toBeInTheDocument()
  })
})
