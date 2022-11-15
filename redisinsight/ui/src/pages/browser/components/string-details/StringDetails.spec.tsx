import React from 'react'
import { useSelector } from 'react-redux'
import { instance, mock } from 'ts-mockito'
import store, { RootState } from 'uiSrc/slices/store'
import { bufferToString } from 'uiSrc/utils'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
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

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

beforeEach(() => {
  const state: RootState = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    browser: {
      ...state.browser,
      string: {
        ...state.browser.string,
        data: {
          key: 'test',
          value: {
            type: 'Buffer',
            data: [49, 34, 43],
          }
        }
      }
    }
  }))
})

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
})
