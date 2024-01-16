import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { cleanup, mockedStore, render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'
import { stringDataSelector, stringSelector } from 'uiSrc/slices/browser/string'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
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

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

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
    const stringDataSelectorMock = jest.fn().mockReturnValueOnce({
      value: {
        type: 'Buffer',
        data: [49, 50, 51],
      }
    });
    (stringDataSelector as jest.Mock).mockImplementationOnce(stringDataSelectorMock)

    render(
      <StringDetails
        {...mockedProps}
      />
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', true)
  })

  it('should not be able to change value (compressed)', () => {
    const stringSelectorMock = jest.fn().mockReturnValueOnce({
      isCompressed: true
    });
    (stringSelector as jest.Mock).mockImplementationOnce(stringSelectorMock)

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

  it('should disable refresh when editing', async () => {
    render(<StringDetails {...mockedProps} />)
    const afterRenderActions = [...store.getActions()]

    await act(() => {
      fireEvent.click(screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true)
    ])
  })
})
