import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { stringDataSelector } from 'uiSrc/slices/browser/string'
import { KeyTypes } from 'uiSrc/constants'
import KeyDetailsHeader, { Props } from './KeyDetailsHeader'

const mockedProps = mock<Props>()

const KEY_INPUT_TEST_ID = 'edit-key-input'
const KEY_BTN_TEST_ID = 'edit-key-btn'
const TTL_INPUT_TEST_ID = 'edit-ttl-input'
const EDIT_VALUE_BTN_TEST_ID = 'edit-key-value-btn'

jest.mock('uiSrc/slices/browser/string', () => ({
  ...jest.requireActual('uiSrc/slices/browser/string'),
  stringDataSelector: jest.fn().mockReturnValue({
    value: {
      type: 'Buffer',
      data: [49, 50, 51, 52],
    }
  }),
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

describe('KeyDetailsHeader', () => {
  global.navigator.clipboard = {
    writeText: jest.fn()
  }

  it('should render', () => {
    expect(render(<KeyDetailsHeader {...mockedProps} />)).toBeTruthy()
  })

  it('should change key properly', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.click(screen.getByTestId(KEY_BTN_TEST_ID))

    fireEvent.change(
      screen.getByTestId(KEY_INPUT_TEST_ID),
      { target: { value: 'key' } }
    )
    expect(screen.getByTestId(KEY_INPUT_TEST_ID)).toHaveValue('key')
  })

  it('should be able to copy key', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.mouseOver(
      screen.getByTestId(KEY_BTN_TEST_ID),
    )

    fireEvent.mouseEnter(
      screen.getByTestId(KEY_BTN_TEST_ID),
    )

    expect(screen.getByLabelText(/Copy key name/i)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/Copy key name/i))
  })

  it('should call onRefresh', () => {
    const onRefresh = jest.fn()
    render(<KeyDetailsHeader {...mockedProps} onRefresh={onRefresh} />)

    fireEvent.click(screen.getByTestId('refresh-key-btn'))
    expect(onRefresh).toBeCalled()
  })

  it('should call onEditKey', () => {
    const onEditKey = jest.fn()
    render(<KeyDetailsHeader {...mockedProps} onEditKey={onEditKey} />)

    fireEvent.click(screen.getByTestId(KEY_BTN_TEST_ID))

    fireEvent.change(
      screen.getByTestId(KEY_INPUT_TEST_ID),
      { target: { value: 'key' } }
    )

    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(onEditKey).toBeCalled()
  })

  it('should change ttl properly', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.click(screen.getByTestId('edit-ttl-btn'))

    fireEvent.change(
      screen.getByTestId(TTL_INPUT_TEST_ID),
      { target: { value: '100' } }
    )

    expect(screen.getByTestId(TTL_INPUT_TEST_ID)).toHaveValue('100')
  })

  it('should be able to change value (long string fully load)', () => {
    render(
      <KeyDetailsHeader
        {...mockedProps}
        keyType={KeyTypes.String}
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
      <KeyDetailsHeader
        {...mockedProps}
        keyType={KeyTypes.String}
      />
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', true)
  })
})
