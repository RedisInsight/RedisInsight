import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen, act } from 'uiSrc/utils/test-utils'

import { fetchVisualisationResults } from 'uiSrc/slices/browser/rejson'
import JSONObject, { Props } from './JSONObject'

const EXPAND_OBJECT = 'expand-object'
const JSON_VALUE = 'json-value'
const JSON_VALUE_DOT = '.jsonValue'
const EDIT_OBJECT_BTN = 'edit-object-btn'

const mockedProps = mock<Props>()

const mockedSimpleJSONObject = { a: 1, b: null, c: 'string', d: true }
const mockedDownloadedObjectWithObjects = {
  a: { b: 1, c: 2, d: null, e: 'string' }
}
const mockedDownloadedObjectWithArray = {
  a: [1, null, 'aaa']
}

jest.mock('uiSrc/slices/browser/rejson', () => ({
  ...jest.requireActual('uiSrc/slices/browser/rejson'),
  setReJSONDataAction: jest.fn,
  fetchVisualisationResults: jest.fn().mockReturnValue(
    Promise.resolve({ data: mockedSimpleJSONObject })
  ),
}))

describe('JSONObject', () => {
  it('should render', () => {
    expect(render(
      <JSONObject
        {...instance(mockedProps)}
        value={mockedSimpleJSONObject}
        keyName="keyName"
      />
    )).toBeTruthy()
  })

  it('should expand simple downloaded JSON', async () => {
    const { container } = render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    expect(container.querySelectorAll(JSON_VALUE_DOT)).toHaveLength(4)
  })

  it('should render and expand downloaded JSON with objects', async () => {
    const { container } = render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedObjectWithObjects}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })
    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    expect(container.querySelectorAll(JSON_VALUE_DOT)).toHaveLength(4)
  })

  it('should render and expand downloaded JSON with array', async () => {
    const { container } = render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedDownloadedObjectWithArray}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('expand-array'))
    })

    expect(container.querySelectorAll(JSON_VALUE_DOT)).toHaveLength(3)
  })

  it('should render simple not downloaded JSON', async () => {
    fetchVisualisationResults.mockImplementation(() => jest.fn().mockReturnValue(
      Promise.resolve({ data: mockedSimpleJSONObject })
    ))
    const { container } = render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    expect(container.querySelectorAll(JSON_VALUE_DOT)).toHaveLength(4)
  })

  it('should render not downloaded JSON with array', async () => {
    fetchVisualisationResults.mockImplementation(() => jest.fn().mockReturnValue(
      Promise.resolve({
        data: [
          1,
          2,
          {
            cardinality: 1,
            key: 'latitude',
            path: '[3]["latitude"]',
            type: 'number',
            value: -7.655525
          },
          {
            cardinality: 1,
            key: 'latitude1',
            path: '[3]["latitude1"]',
            type: 'array',
            value: [],
          },
          {
            cardinality: 1,
            key: 'latitude2',
            path: '[3]["latitude2"]',
            type: 'object',
            value: { },
          }
        ]
      })
    ))
    const { container } = render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    expect(container.querySelectorAll(JSON_VALUE_DOT)).toHaveLength(3)
  })

  it('should render inline editor to add', async () => {
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/expand-object/i))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/add-field-btn/i))
    })

    expect(screen.getByTestId('apply-btn')).toBeInTheDocument()
  })

  it('should not be able to add value with wrong json', async () => {
    const onJSONPropertyAdded = jest.fn()
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      onJSONPropertyAdded={onJSONPropertyAdded}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/expand-object/i))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId(/add-field-btn/i))
    })

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"a"' }
    })

    fireEvent.change(screen.getByTestId(JSON_VALUE), {
      target: { value: '{' }
    })

    expect(onJSONPropertyAdded).not.toBeCalled()
    // expect(screen.getByTestId('apply-btn')).toBeDisabled();
  })

  it('should apply proper value to add element in object', async () => {
    const onJSONPropertyAdded = jest.fn()
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={jest.fn()}
      onJSONPropertyAdded={onJSONPropertyAdded}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EXPAND_OBJECT))
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('add-field-btn'))
    })

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"key"' }
    })

    fireEvent.change(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' }
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(onJSONPropertyAdded).toBeCalled()
  })

  it('should render inline editor to edit value', async () => {
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    expect(screen.getByTestId(JSON_VALUE)).toBeInTheDocument()
  })

  it('should change value when editing', async () => {
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.change(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' }
    })

    expect(screen.getByTestId(JSON_VALUE)).toHaveValue('{}')
  })

  it('should not apply wrong value for edit', async () => {
    const onJSONPropertyEdited = jest.fn()
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      onJSONPropertyEdited={onJSONPropertyEdited}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.change(screen.getByTestId(JSON_VALUE), {
      target: { value: '{' }
    })

    expect(onJSONPropertyEdited).not.toBeCalled()
    // expect(screen.getByTestId('apply-edit-btn')).toBeDisabled()
  })

  it('should apply proper value for edit', async () => {
    const onJSONPropertyEdited = jest.fn()
    render(<JSONObject
      {...instance(mockedProps)}
      keyName="keyName"
      value={mockedSimpleJSONObject}
      shouldRejsonDataBeDownloaded={false}
      onJSONKeyExpandAndCollapse={jest.fn()}
      handleSubmitJsonUpdateValue={jest.fn()}
      onJSONPropertyEdited={onJSONPropertyEdited}
    />)

    await act(async () => {
      await fireEvent.click(screen.getByTestId(EDIT_OBJECT_BTN))
    })

    fireEvent.change(screen.getByTestId(JSON_VALUE), {
      target: { value: '{}' }
    })

    await act(async () => {
      await fireEvent.click(screen.getByTestId('apply-edit-btn'))
    })

    expect(onJSONPropertyEdited).toBeCalled()
  })
})
