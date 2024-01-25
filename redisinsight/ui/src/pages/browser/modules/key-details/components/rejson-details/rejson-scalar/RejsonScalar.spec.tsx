import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  JSONScalarProps
} from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'
import RejsonScalar from './RejsonScalar'

const INLINE_ITEM_EDITOR = 'inline-item-editor'

const mockedProps = mock<JSONScalarProps>()

describe('JSONScalar', () => {
  it('should render', () => {
    expect(render(
      <RejsonScalar
        {...instance(mockedProps)}
        keyName="keyName"
      />
    )).toBeTruthy()
  })

  it('should render string', () => {
    expect(render(
      <RejsonScalar
        {...instance(mockedProps)}
        value="string"
        keyName="keyName"
      />
    )).toBeTruthy()
  })

  it('should render null', () => {
    expect(render(
      <RejsonScalar
        {...instance(mockedProps)}
        value={null}
        keyName="keyName"
      />
    )).toBeTruthy()
  })

  it('should render number', () => {
    expect(render(
      <RejsonScalar
        {...instance(mockedProps)}
        value={123123}
        keyName="keyName"
      />
    )).toBeTruthy()
  })

  it('should render boolean', () => {
    expect(render(
      <RejsonScalar
        {...instance(mockedProps)}
        value
        keyName="keyName"
      />
    )).toBeTruthy()
  })

  it('should render inline edit after click', () => {
    render(<RejsonScalar
      {...instance(mockedProps)}
      value="string"
      keyName="keyName"
    />)
    fireEvent.click(screen.getByTestId(/json-scalar-value/i))
    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toBeInTheDocument()
  })

  it('should change value', () => {
    render(<RejsonScalar
      {...instance(mockedProps)}
      value="string"
      keyName="keyName"
    />)
    fireEvent.click(screen.getByTestId(/json-scalar-value/i))
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
      target: { value: 'true' }
    })

    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue('true')
  })

  it('should be able to apply value with wrong json', () => {
    const handleEdit = jest.fn()
    render(<RejsonScalar
      {...instance(mockedProps)}
      handleSubmitJsonUpdateValue={jest.fn()}
      value="string"
      keyName="keyName"
    />)
    fireEvent.click(screen.getByTestId(/json-scalar-value/i))
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
      target: { value: '{' }
    })

    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(handleEdit).not.toBeCalled()
  })
})
