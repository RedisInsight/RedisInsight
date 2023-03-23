import React from 'react'
import { instance, mock } from 'ts-mockito'
import { KeyValueCompressor } from 'uiSrc/constants'
import { stringDataSelector } from 'uiSrc/slices/browser/string'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { anyToBuffer, bufferToString } from 'uiSrc/utils'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { GZIP_COMPRESSED_VALUE_1, GZIP_COMPRESSED_VALUE_2, DECOMPRESSED_VALUE_STR_1, DECOMPRESSED_VALUE_STR_2 } from 'uiSrc/utils/tests/decompressors'
import StringDetails, { Props } from './StringDetails'

const STRING_VALUE = 'string-value'
const STRING_VALUE_SPACE = 'string value'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/string', () => ({
  ...jest.requireActual('uiSrc/slices/browser/string'),
  stringDataSelector: jest.fn().mockReturnValue({
    value: {
      type: 'Buffer',
      data: [49, 50, 51],
    }
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    compressor: null,
  }),
}))

describe('StringDetails', () => {
  it('should render', () => {
    expect(
      render(
        <StringDetails
          {...instance(mockedProps)}
        />
      )
    ).toBeTruthy()
  })

  it('should render textarea if edit mode', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    expect(textArea).toBeInTheDocument()
  })

  it('should update string value', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } }
    )
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  it('should stay empty string after cancel', async () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } }
    )
    const btnACancel = screen.getByTestId('cancel-btn')
    await act(() => {
      fireEvent.click(btnACancel)
    })
    const textArea2 = screen.getByTestId(STRING_VALUE)
    expect(textArea2).toHaveValue(bufferToString({
      type: 'Buffer',
      data: [49, 50, 51],
    }))
  })

  it('should update value after apply', () => {
    render(
      <StringDetails
        {...instance(mockedProps)}
        isEditItem
        setIsEdit={jest.fn()}
      />
    )
    const textArea = screen.getByTestId(STRING_VALUE)
    fireEvent.change(
      textArea,
      { target: { value: STRING_VALUE_SPACE } }
    )
    const btnApply = screen.getByTestId('apply-btn')
    fireEvent.click(btnApply)
    expect(textArea).toHaveValue(STRING_VALUE_SPACE)
  })

  describe('decompressed  data', () => {
    it('should render decompressed GZIP data = "1"', () => {
      const stringDataSelectorMock = jest.fn().mockReturnValue({
        value: anyToBuffer(GZIP_COMPRESSED_VALUE_1)
      })
      stringDataSelector.mockImplementation(stringDataSelectorMock)

      connectedInstanceSelector.mockImplementation(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      render(
        <StringDetails
          {...instance(mockedProps)}
          isEditItem
          setIsEdit={jest.fn()}
        />
      )
      const textArea = screen.getByTestId(STRING_VALUE)

      expect(textArea).toHaveValue(DECOMPRESSED_VALUE_STR_1)
    })

    it('should render decompressed GZIP data = "2"', () => {
      const stringDataSelectorMock = jest.fn().mockReturnValue({
        value: anyToBuffer(GZIP_COMPRESSED_VALUE_2)
      })
      stringDataSelector.mockImplementation(stringDataSelectorMock)

      connectedInstanceSelector.mockImplementation(() => ({
        compressor: KeyValueCompressor.GZIP,
      }))

      render(
        <StringDetails
          {...instance(mockedProps)}
          isEditItem
          setIsEdit={jest.fn()}
        />
      )
      const textArea = screen.getByTestId(STRING_VALUE)

      expect(textArea).toHaveValue(DECOMPRESSED_VALUE_STR_2)
    })
  })
})
