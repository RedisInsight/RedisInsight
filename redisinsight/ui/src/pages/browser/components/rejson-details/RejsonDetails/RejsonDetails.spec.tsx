import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import RejsonDetails, { Props } from './RejsonDetails'

const mockedProps = mock<Props>()

const mockedJSONObject = [
  {
    key: '_id',
    path: '["_id"]',
    cardinality: 1,
    type: 'string',
    value: '60adf79282e738b05531b345'
  },
  {
    key: '_id2',
    path: '["_id2"]',
    cardinality: 1,
    type: 'string',
    value: '60adf79282b05531b345'
  },
  {
    key: '_id3',
    path: '["_id3"]',
    cardinality: 3,
    type: 'array',
    value: [1, 2, 3]
  }
]

const mockedJSONString = 'string'
const mockedJSONNull = null
const mockedJSONBoolean = true
const mockedJSONNumber = 123123

describe('RejsonDetails', () => {
  it('should render', () => {
    expect(render(
      <RejsonDetails
        {...instance(mockedProps)}
        selectedKey="keyName"
      />
    )).toBeTruthy()
  })

  describe('should render JSON object', () => {
    it('should be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONObject}
          path="."
          dataType="object"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded
        />
      )).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONObject}
          path="."
          dataType="object"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded={false}
        />
      )).toBeTruthy()
    })
  })

  describe('should render JSON array', () => {
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={[1, 2, 3]}
          path="."
          dataType="array"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded={false}
        />
      )).toBeTruthy()
    })
  })

  describe('should render JSON string', () => {
    it('should be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONString}
          dataType="string"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded
        />
      )).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONString}
          dataType="string"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded={false}
        />
      )).toBeTruthy()
    })
  })

  describe('should render JSON null', () => {
    it('should be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONNull}
          dataType="null"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded
        />
      )).toBeTruthy()
    })
    it('should not be downloaded', () => {
      expect(render(
        <RejsonDetails
          {...instance(mockedProps)}
          data={mockedJSONNull}
          dataType="null"
          selectedKey="keyName"
          shouldRejsonDataBeDownloaded={false}
        />
      )).toBeTruthy()
    })
  })

  it('should render JSON boolean', () => {
    expect(render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={mockedJSONBoolean}
        dataType="boolean"
        selectedKey="keyName"
      />
    )).toBeTruthy()
  })

  it('should render JSON number', () => {
    expect(render(
      <RejsonDetails
        {...instance(mockedProps)}
        data={mockedJSONNumber}
        dataType="number"
        selectedKey="keyName"
      />
    )).toBeTruthy()
  })

  it('should open inline editor to add JSON key value for object', () => {
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      path="."
      dataType="object"
      selectedKey="keyName"
      shouldRejsonDataBeDownloaded={false}
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    expect(screen.getByTestId('json-key')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toBeInTheDocument()
  })

  it('should be able to add proper key value into json object', () => {
    const onJSONPropertyAdded = jest.fn()
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      onJSONPropertyAdded={onJSONPropertyAdded}
      path="."
      dataType="object"
      selectedKey="keyName"
      handleSubmitJsonUpdateValue={jest.fn()}
      shouldRejsonDataBeDownloaded={false}
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(
      screen.getByTestId('json-key'),
      {
        target: { value: '"key"' }
      }
    )
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '"value"' }
      }
    )
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(onJSONPropertyAdded).toBeCalled()
  })

  it('should not be able to add wrong key value into json object', () => {
    const onJSONPropertyAdded = jest.fn()
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      path="."
      onJSONPropertyAdded={onJSONPropertyAdded}
      dataType="object"
      selectedKey="keyName"
      handleSubmitJsonUpdateValue={jest.fn()}
      shouldRejsonDataBeDownloaded={false}
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(
      screen.getByTestId('json-key'),
      {
        target: { value: '"key"' }
      }
    )
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '{' }
      }
    )
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(onJSONPropertyAdded).not.toBeCalled()
  })

  it('should be able to add proper value into json array', () => {
    const onJSONPropertyAdded = jest.fn()
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={[1, 2, 3]}
      path="."
      onJSONPropertyAdded={onJSONPropertyAdded}
      dataType="array"
      selectedKey="keyName"
      handleSubmitJsonUpdateValue={jest.fn()}
      shouldRejsonDataBeDownloaded={false}
    />)

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '1' }
      }
    )
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(onJSONPropertyAdded).toBeCalled()
  })

  it('should not be able to add wrong value into json array', () => {
    const onJSONPropertyAdded = jest.fn()
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={[1, 2, 3]}
      path="."
      dataType="array"
      onJSONPropertyAdded={onJSONPropertyAdded}
      selectedKey="keyName"
      shouldRejsonDataBeDownloaded={false}
    />)

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '{' }
      }
    )
    expect(onJSONPropertyAdded).not.toBeCalled()
  })

  it('should submit to add proper key value into json object', () => {
    const onJSONPropertyAdded = jest.fn()
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={{ a: 1, b: 2 }}
      path="."
      dataType="object"
      selectedKey="keyName"
      shouldRejsonDataBeDownloaded={false}
      onJSONPropertyAdded={onJSONPropertyAdded}
      handleSubmitJsonUpdateValue={jest.fn()}
    />)

    fireEvent.click(screen.getByTestId('add-object-btn'))
    fireEvent.change(
      screen.getByTestId('json-key'),
      {
        target: { value: '"key"' }
      }
    )
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '"value"' }
      }
    )
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(onJSONPropertyAdded).toBeCalled()
  })

  it('should submit to add proper value into json array', () => {
    const onJSONPropertyAdded = jest.fn()
    render(<RejsonDetails
      {...instance(mockedProps)}
      data={[1, 2, 3]}
      path="."
      dataType="array"
      selectedKey="keyName"
      shouldRejsonDataBeDownloaded={false}
      onJSONPropertyAdded={onJSONPropertyAdded}
      handleSubmitJsonUpdateValue={jest.fn()}
    />)

    fireEvent.click(screen.getByTestId('add-array-btn'))
    fireEvent.change(
      screen.getByTestId('json-value'),
      {
        target: { value: '1' }
      }
    )
    fireEvent.click(screen.getByTestId('apply-btn'))
    expect(onJSONPropertyAdded).toBeCalled()
  })
})
