import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { fetchVisualisationResults } from 'uiSrc/slices/browser/rejson'
import JSONArray, { Props } from './JSONArray'

const EXPAND_ARRAY = 'expand-array'
const JSON_ARRAY_DOT = '.jsonValue'
const JSON_ARRAY = 'json-value'
const BTN_EDIT_FIELD = 'btn-edit-field'

const mockedProps = mock<Props>()

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
    expect(render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      shouldRejsonDataBeDownloaded={false}
      value={mockedDownloadedArrayWithObjects}
    />)).toBeTruthy()
  })

  it('should expand simple downloaded JSON', async () => {
    const { container } = render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(3)
  })

  it('should render and expand downloaded JSON with objects', async () => {
    const { container } = render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedArrayWithObjects}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
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
    const { container } = render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedArrayWithArrays}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    await act(async () => {
      await fireEvent.click(screen.getAllByTestId(EXPAND_ARRAY)[1])
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(2)
  })

  it('should render simple not downloaded JSON', async () => {
    fetchVisualisationResults.mockImplementation(() => jest.fn().mockReturnValue(
      Promise.resolve({ data: mockedDownloadedSimpleArray })
    ))
    const { container } = render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(3)
  })

  it('should render not downloaded JSON with arrays', async () => {
    fetchVisualisationResults.mockImplementation(() => jest.fn().mockReturnValue(
      Promise.resolve({ data: mockedDownloadedArrayWithArrays })
    ))
    const { container } = render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(4)
  })

  it('should render not downloaded JSON with objects', async () => {
    fetchVisualisationResults.mockImplementation(() => jest.fn().mockReturnValue(
      Promise.resolve({ data: mockedDownloadedArrayWithObjects })
    ))
    const { container } = render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_ARRAY))
    })

    expect(container.querySelectorAll(JSON_ARRAY_DOT)).toHaveLength(6)
  })

  it('should render inline editor to add', async () => {
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
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
    const onJSONPropertyAdded = jest.fn()
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={jest.fn()}
      onJSONPropertyAdded={onJSONPropertyAdded}
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

    expect(onJSONPropertyAdded).not.toBeCalled()
  })

  it('should apply proper value to add element in array', async () => {
    const onJSONPropertyAdded = jest.fn()
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={jest.fn()}
      onJSONPropertyAdded={onJSONPropertyAdded}
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

    expect(onJSONPropertyAdded).toBeCalled()
  })

  it('should render inline editor to edit value', async () => {
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(BTN_EDIT_FIELD))
    })

    expect(screen.getByTestId(JSON_ARRAY)).toBeInTheDocument()
  })

  it('should change value when editing', async () => {
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(BTN_EDIT_FIELD))
    })

    fireEvent.change(screen.getByTestId(JSON_ARRAY), {
      target: { value: '{}' }
    })

    expect(screen.getByTestId(JSON_ARRAY)).toHaveValue('{}')
  })

  it('should not be apply wrong value for edit', async () => {
    const onJSONPropertyEdited = jest.fn()
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={jest.fn()}
      onJSONPropertyEdited={onJSONPropertyEdited}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(BTN_EDIT_FIELD))
    })

    fireEvent.change(screen.getByTestId(JSON_ARRAY), {
      target: { value: '{' }
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('apply-edit-btn'))
    })

    expect(onJSONPropertyEdited).not.toBeCalled()
  })

  it('should apply proper value for edit', async () => {
    const onJSONPropertyEdited = jest.fn()
    render(<JSONArray
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedSimpleArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={jest.fn()}
      onJSONPropertyEdited={onJSONPropertyEdited}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(BTN_EDIT_FIELD))
    })

    fireEvent.change(screen.getByTestId(JSON_ARRAY), {
      target: { value: '{}' }
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('apply-edit-btn'))
    })

    expect(onJSONPropertyEdited).toBeCalled()
  })
})
