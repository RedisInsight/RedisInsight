import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  JSONArrayProps
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import RejsonArray from './RejsonArray'

const EXPAND_ARRAY = 'expand-array'
const JSON_ARRAY_DOT = '.jsonValue'
const JSON_ARRAY = 'json-value'
const BTN_EDIT_FIELD = 'btn-edit-field'

const mockedProps = mock<JSONArrayProps>()

const mockedDownloadedSimpleArray = [1, 2, 3]

const mockedDownloadedArrayWithObjects = [
  { id: 0, name: 'Kidd Fields' },
  { id: 1, name: 'Lucinda Gallagher' },
  { id: 2, name: 'Shanna Forbes' }
]

const mockedDownloadedArrayWithArrays = [
  [1, 2],
  [3, 4]
]

jest.mock('uiSrc/slices/browser/rejson', () => ({
  ...jest.requireActual('uiSrc/slices/browser/rejson'),
  appendReJSONArrayItemAction: jest.fn,
  setReJSONDataAction: jest.fn,
  fetchVisualisationResults: jest.fn().mockReturnValue(
    Promise.resolve({ data: mockedDownloadedSimpleArray })
  ),
}))

describe('JSONArray', () => {
  it('should render simple JSON', () => {
    expect(render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      shouldRejsonDataBeDownloaded={false}
      value={mockedDownloadedArrayWithObjects}
    />)).toBeTruthy()
  })

  it('should expand simple downloaded JSON', async () => {
    const { container } = render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJsonKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(3)
  })

  it('should render and expand downloaded JSON with objects', async () => {
    const { container } = render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedArrayWithObjects}
      shouldRejsonDataBeDownloaded={false}
      onJsonKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    await act(async () => {
      await fireEvent.click(screen.getAllByTestId('expand-object')[0])
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(2)
  })

  it('should render and expand downloaded JSON with arrays', async () => {
    const { container } = render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedArrayWithArrays}
      shouldRejsonDataBeDownloaded={false}
      onJsonKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    await act(async () => {
      await fireEvent.click(screen.getAllByTestId(EXPAND_ARRAY)[1])
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(2)
  })

  it('should render inline editor to add', async () => {
    render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJsonKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/expand-array/i))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/add-field-btn/i))
    })

    expect(screen.getByTestId('apply-btn')).toBeInTheDocument()
  })

  it('should not be able to add value with wrong json', async () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleAppendRejsonArrayItemAction = jest.fn()
    render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJsonKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
      handleAppendRejsonArrayItemAction={handleAppendRejsonArrayItemAction}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/expand-array/i))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/add-field-btn/i))
    })

    fireEvent.change(screen.getByTestId(JSON_ARRAY), {
      target: { value: '{' }
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(handleSubmitJsonUpdateValue).not.toBeCalled()
    expect(handleAppendRejsonArrayItemAction).not.toBeCalled()
  })

  it('should apply proper value to add element in array', async () => {
    const handleSubmitJsonUpdateValue = jest.fn()
    const handleAppendRejsonArrayItemAction = jest.fn()
    render(<RejsonArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJsonKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={handleSubmitJsonUpdateValue}
      handleAppendRejsonArrayItemAction={handleAppendRejsonArrayItemAction}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('add-field-btn'))
    })

    fireEvent.change(screen.getByTestId(JSON_ARRAY), {
      target: { value: '{}' }
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(handleSubmitJsonUpdateValue).toBeCalled()
    expect(handleAppendRejsonArrayItemAction).toBeCalled()
  })
})
