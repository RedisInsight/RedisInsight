import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ListDetails from './ListDetails'

const elements = ['element1', 'element2', 'element3']

jest.mock('uiSrc/slices/browser/list', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/list').initialState
  return {
    listSelector: jest.fn().mockReturnValue(defaultState),
    updateListValueStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.updateValue),
    listDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: 'z',
      keyName: 'z',
      elements,
    }),
    fetchListElements: jest.fn(),
    fetchSearchingListElementAction: jest.fn,
    setListInitialState: jest.fn,
  }
})

describe('ListDetails', () => {
  it('should render', () => {
    expect(render(<ListDetails />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<ListDetails />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]'
    )
    expect(rows).toHaveLength(elements.length)
  })

  it('should render search input', () => {
    render(<ListDetails />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<ListDetails />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '111' } })
    expect(searchInput).toHaveValue('111')
  })

  it('should render editor after click edit button', () => {
    render(<ListDetails />)
    fireEvent.click(screen.getAllByTestId(/edit-list-button/)[0])
    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
  })
})
