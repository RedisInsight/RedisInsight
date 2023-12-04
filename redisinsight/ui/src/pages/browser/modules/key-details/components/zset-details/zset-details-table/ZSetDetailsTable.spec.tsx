import React from 'react'
import { instance, mock } from 'ts-mockito'
import { zsetDataSelector } from 'uiSrc/slices/browser/zset'
import { anyToBuffer } from 'uiSrc/utils'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { GZIP_COMPRESSED_VALUE_1, DECOMPRESSED_VALUE_STR_1 } from 'uiSrc/utils/tests/decompressors'
import { ZSetDetailsTable, Props } from './ZSetDetailsTable'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/zset', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/zset').initialState
  return ({
    zsetSelector: jest.fn().mockReturnValue(defaultState),
    setZsetInitialState: jest.fn,
    zsetDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 4,
      key: 'z',
      keyName: 'z',
      members: [
        { name: { type: 'Buffer', data: [49] }, score: 1 },
        { name: { type: 'Buffer', data: [50] }, score: 2 },
        { name: { type: 'Buffer', data: [51] }, score: 3 },
        { name: { type: 'Buffer', data: [52] }, score: 'inf' },
      ],
    }),
    updateZsetScoreStateSelector: jest.fn().mockReturnValue(defaultState.updateScore),
    fetchSearchZSetMembers: () => jest.fn()
  })
})

describe('ZSetDetailsTable', () => {
  it('should render', () => {
    expect(render(<ZSetDetailsTable {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render search input', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeTruthy()
  })

  it('should call search', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(
      searchInput,
      { target: { value: '*' } }
    )
    expect(searchInput).toHaveValue('*')
  })

  it('should render delete popup after click remove button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/zset-edit-button/)[0])
    expect(screen.getByTestId(/zset-edit-button-1/)).toBeInTheDocument()
  })

  it('should render disabled edit button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId(/zset-edit-button-4/)).toBeDisabled()
  })

  it('should render enabled edit button', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId(/zset-edit-button-3/)).not.toBeDisabled()
  })

  it('should render editor after click edit button and able to change value', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/zset-edit-button/)[0])
    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('inline-item-editor'), { target: { value: '123' } })
    expect(screen.getByTestId('inline-item-editor')).toHaveValue('123')
  })

  it('should render resize trigger for name column', () => {
    render(<ZSetDetailsTable {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-name')).toBeInTheDocument()
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/zset').initialState
      const zsetDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        key: '123zxczxczxc',
        members: [
          { name: anyToBuffer(GZIP_COMPRESSED_VALUE_1), score: 1 },
        ]
      })
      zsetDataSelector.mockImplementation(zsetDataSelectorMock)

      const { queryByTestId } = render(<ZSetDetailsTable {...instance(mockedProps)} />)
      const memberEl = queryByTestId(/zset-member-value-/)

      expect(memberEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
    })
  })
})
