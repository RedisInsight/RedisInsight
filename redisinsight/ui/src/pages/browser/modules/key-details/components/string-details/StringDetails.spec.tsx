import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { stringDataSelector, stringSelector } from 'uiSrc/slices/browser/string'
import { Props, StringDetails } from './StringDetails'

const mockedProps = mock<Props>()
const EDIT_VALUE_BTN_TEST_ID = 'edit-key-value-btn'

jest.mock('uiSrc/slices/browser/string', () => ({
  ...jest.requireActual('uiSrc/slices/browser/string'),
  stringDataSelector: jest.fn().mockReturnValue({
    value: {
      type: 'Buffer',
      data: [49, 50, 51, 52],
    }
  }),
  stringSelector: jest.fn().mockReturnValue({
    isCompressed: false
  })
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn().mockReturnValue({
    name: {
      type: 'Buffer',
      data: [116, 101, 115, 116]
    },
    nameString: 'test',
    length: 4
  }),
}))

describe('StringDetails', () => {
  it('should render', () => {
    expect(render(<StringDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should be able to change value (long string fully load)', () => {
    render(
      <StringDetails
        {...mockedProps}
      />
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', false)
  })

  it('should not be able to change value (long string not fully load)', () => {
    const stringDataSelectorMock = jest.fn().mockReturnValue({
      value: {
        type: 'Buffer',
        data: [49, 50, 51],
      }
    })
    stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(
      <StringDetails
        {...mockedProps}
      />
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', true)
  })

  it('should not be able to change value (compressed)', () => {
    const stringSelectorMock = jest.fn().mockReturnValue({
      isCompressed: true
    })
    stringSelector.mockImplementation(stringSelectorMock)

    render(
      <StringDetails
        {...mockedProps}
      />
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', true)
  })

  it('"edit-key-value-btn" should render', () => {
    const { queryByTestId } = render(<StringDetails {...instance(mockedProps)} />)
    expect(queryByTestId('edit-key-value-btn')).toBeInTheDocument()
  })
})
