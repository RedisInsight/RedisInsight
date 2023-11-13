import React from 'react'
import { instance, mock } from 'ts-mockito'
import { KeyValueCompressor, TEXT_DISABLED_COMPRESSED_VALUE } from 'uiSrc/constants'
import { hashDataSelector } from 'uiSrc/slices/browser/hash'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBufferType } from 'uiSrc/slices/interfaces'
import { anyToBuffer, bufferToString } from 'uiSrc/utils'
import { act, fireEvent, render, screen, waitForEuiToolTipVisible } from 'uiSrc/utils/test-utils'
import { GZIP_COMPRESSED_VALUE_1, GZIP_COMPRESSED_VALUE_2, DECOMPRESSED_VALUE_STR_1, DECOMPRESSED_VALUE_STR_2 } from 'uiSrc/utils/tests/decompressors'
import HashDetails, { Props } from './HashDetails'

const mockedProps = mock<Props>()
const fields: Array<{ field: RedisResponseBufferType, value: RedisResponseBufferType }> = [
  { field: { type: 'Buffer', data: [49] }, value: { type: 'Buffer', data: [49, 65] } },
  { field: { type: 'Buffer', data: [49, 50, 51] }, value: { type: 'Buffer', data: [49, 11] } },
  { field: { type: 'Buffer', data: [50] }, value: { type: 'Buffer', data: [49, 234, 453] } },
]

jest.mock('uiSrc/slices/browser/hash', () => {
  const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
  return ({
    hashSelector: jest.fn().mockReturnValue(defaultState),
    updateHashValueStateSelector: jest.fn().mockReturnValue(defaultState.updateValue),
    hashDataSelector: jest.fn().mockReturnValue({
      ...defaultState,
      total: 3,
      key: '123zxczxczxc',
      fields
    }),
    setHashInitialState: jest.fn,
    fetchHashFields: () => jest.fn
  })
})

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

describe('HashDetails', () => {
  it('should render', () => {
    expect(render(<HashDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render rows properly', () => {
    const { container } = render(<HashDetails {...instance(mockedProps)} />)
    const rows = container.querySelectorAll('.ReactVirtualized__Table__row[role="row"]')
    expect(rows).toHaveLength(fields.length)
  })

  it('should render search input', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('search')).toBeTruthy()
  })

  it('should call search', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(
      searchInput,
      { target: { value: '*1*' } }
    )
    expect(searchInput).toHaveValue('*1*')
  })

  it('should render delete popup after click remove button', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/remove-hash-button/)[0])
    expect(screen.getByTestId(`remove-hash-button-${bufferToString(fields[0].field)}-icon`)).toBeInTheDocument()
  })

  it('should render editor after click edit button', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    fireEvent.click(screen.getAllByTestId(/edit-hash-button/)[0])
    expect(screen.getByTestId('hash-value-editor')).toBeInTheDocument()
  })

  it('should render resize trigger for field column', () => {
    render(<HashDetails {...instance(mockedProps)} />)
    expect(screen.getByTestId('resize-trigger-field')).toBeInTheDocument()
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data', () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
      const hashDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        total: 1,
        key: '123zxczxczxc',
        fields: [
          { field: anyToBuffer(GZIP_COMPRESSED_VALUE_1), value: anyToBuffer(GZIP_COMPRESSED_VALUE_2) },
        ]
      })
      hashDataSelector.mockImplementation(hashDataSelectorMock)

      const { queryByTestId, queryAllByTestId } = render(<HashDetails {...instance(mockedProps)} />)
      const fieldEl = queryAllByTestId(/hash-field-/)?.[0]
      const valueEl = queryByTestId(/hash-field-value/)

      expect(fieldEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_1)
      expect(valueEl).toHaveTextContent(DECOMPRESSED_VALUE_STR_2)
    })

    it('edit button should be disabled if data was compressed', async () => {
      const defaultState = jest.requireActual('uiSrc/slices/browser/hash').initialState
      const hashDataSelectorMock = jest.fn().mockReturnValue({
        ...defaultState,
        total: 1,
        key: '123zxczxczxc',
        fields: [
          { field: anyToBuffer(GZIP_COMPRESSED_VALUE_1), value: anyToBuffer(GZIP_COMPRESSED_VALUE_2) },
        ]
      })
      hashDataSelector.mockImplementation(hashDataSelectorMock)

      connectedInstanceSelector.mockImplementation(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      const { queryByTestId } = render(<HashDetails {...instance(mockedProps)} />)
      const editBtn = queryByTestId(/edit-hash-button/)

      fireEvent.click(editBtn)

      await act(async () => {
        fireEvent.mouseOver(editBtn)
      })
      await waitForEuiToolTipVisible()

      expect(editBtn).toBeDisabled()
      expect(screen.getByTestId('hash-edit-tooltip')).toHaveTextContent(TEXT_DISABLED_COMPRESSED_VALUE)
      expect(queryByTestId('hash-value-editor')).not.toBeInTheDocument()
    })
  })
})
