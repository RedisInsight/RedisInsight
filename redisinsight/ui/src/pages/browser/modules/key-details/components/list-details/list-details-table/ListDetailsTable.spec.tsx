import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { KeyValueCompressor, TEXT_DISABLED_COMPRESSED_VALUE } from 'uiSrc/constants'
import { listDataSelector } from 'uiSrc/slices/browser/list'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { anyToBuffer } from 'uiSrc/utils'
import { act, cleanup, fireEvent, mockedStore, render, screen, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'
import { GZIP_COMPRESSED_VALUE_1, DECOMPRESSED_VALUE_STR_1 } from 'uiSrc/utils/tests/decompressors'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { ListDetailsTable, Props } from './ListDetailsTable'

const mockedProps = mock<Props>()

const elements = [
  { element: { type: 'Buffer', data: [49] }, index: 0 },
  { element: { type: 'Buffer', data: [50] }, index: 1 },
  { element: { type: 'Buffer', data: [51] }, index: 2 },
]

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
      key: { type: 'Buffer', data: [49] },
      keyName: { type: 'Buffer', data: [49] },
      elements,
    }),
    fetchListElements: jest.fn(),
    fetchSearchingListElementAction: jest.fn,
    setListInitialState: jest.fn,
  }
})

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ListDetailsTable', () => {
  it('should render', () => {
    expect(render(<ListDetailsTable {...mockedProps} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<ListDetailsTable {...mockedProps} />)
    const rows = container.querySelectorAll(
      '.ReactVirtualized__Table__row[role="row"]'
    )
    expect(rows).toHaveLength(elements.length)
  })

  it('should render search input', () => {
    render(<ListDetailsTable {...mockedProps} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<ListDetailsTable {...mockedProps} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, { target: { value: '111' } })
    expect(searchInput).toHaveValue('111')
  })

  it('should render editor after click edit button', async () => {
    render(<ListDetailsTable {...mockedProps} />)
    await act(() => {
      fireEvent.click(screen.getAllByTestId(/edit-list-button/)[0])
    })
    expect(screen.getByTestId('element-value-editor')).toBeInTheDocument()
  })

  it('should render resize trigger for index column', () => {
    render(<ListDetailsTable {...mockedProps} />)
    expect(screen.getByTestId('resize-trigger-index')).toBeInTheDocument()
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/list').initialState
      const listDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        elements: [
          { element: anyToBuffer(GZIP_COMPRESSED_VALUE_1), index: 0 },
        ]
      });
      (listDataSelector as jest.Mock).mockImplementation(listDataSelectorMock)

      const { queryByTestId } = render(<ListDetailsTable {...(mockedProps)} />)
      const elementEl = queryByTestId(/list-element-value-/)

      expect(elementEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
    })

    it('edit button should be disabled if data was compressed', async () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/list').initialState
      const listDataSelectorMock = jest.fn().mockReturnValueOnce({
        ...defaultState,
        key: '123zxczxczxc',
        elements: [
          { element: anyToBuffer(GZIP_COMPRESSED_VALUE_1), index: 0 },
        ]
      });
      (listDataSelector as jest.Mock).mockImplementationOnce(listDataSelectorMock);

      (connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      const { queryByTestId } = render(<ListDetailsTable {...(mockedProps)} />)
      const editBtn = queryByTestId(/edit-list-button-/)!

      fireEvent.click(editBtn)

      await act(async () => {
        fireEvent.mouseOver(editBtn)
      })
      await waitForEuiToolTipVisible()

      expect(editBtn).toBeDisabled()
      expect(screen.getByTestId('list-edit-tooltip')).toHaveTextContent(TEXT_DISABLED_COMPRESSED_VALUE)
      expect(queryByTestId('list-value-editor')).not.toBeInTheDocument()
    })
  })

  it('should disable refresh when editing', async () => {
    render(<ListDetailsTable {...mockedProps} />)

    const afterRenderActions = [...store.getActions()]

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-list-button-0'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true)
    ])
  })
})
