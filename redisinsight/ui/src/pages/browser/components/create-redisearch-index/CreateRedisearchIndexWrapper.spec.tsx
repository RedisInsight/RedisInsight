import { cloneDeep } from 'lodash'
import React from 'react'
import { createIndex } from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { render, screen, fireEvent, cleanup, mockedStore } from 'uiSrc/utils/test-utils'

import CreateRedisearchIndexWrapper from './CreateRedisearchIndexWrapper'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
    modules: [],
  }),
}))

const onClose = jest.fn()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CreateRedisearchIndexWrapper', () => {
  it('should render', () => {
    expect(render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)).toBeTruthy()
  })

  it('should call onClose after click cross icon', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    fireEvent.click(screen.getByTestId('create-index-close-panel'))
    expect(onClose).toBeCalled()
    onClose.mockRestore()
  })

  it('should call onClose after click cancel', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    fireEvent.click(screen.getByTestId('create-index-cancel-btn'))
    expect(onClose).toBeCalled()
    onClose.mockRestore()
  })

  it('should add prefix and delete it', () => {
    const { container } = render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    const comboboxInput = container
      .querySelector('[data-testid="prefix-combobox"] [data-test-subj="comboBoxSearchInput"]') as HTMLInputElement

    fireEvent.change(
      comboboxInput,
      { target: { value: 'val1' } }
    )

    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 13, charCode: 13 })

    const containerLabels = container.querySelector('[data-test-subj="comboBoxInput"]')!
    expect(containerLabels.querySelector('[title="val1"]')).toBeInTheDocument()

    fireEvent.click(containerLabels.querySelector('[title^="Remove val1"]')!)
    expect(containerLabels.querySelector('[title="val1"]')).not.toBeInTheDocument()
  })

  it('should be preselected hash type', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    expect(screen.getByTestId('key-type')).toHaveTextContent('Hash')
  })

  it('should call proper action on submit', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    const expectedActions = [createIndex()]
    fireEvent.click(screen.getByTestId('create-index-btn'))

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should properly change all fields', () => {
    const { queryByText, container } = render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    const containerLabels = container.querySelector('[data-test-subj="comboBoxInput"]')!
    const comboboxInput = container
      .querySelector('[data-testid="prefix-combobox"] [data-test-subj="comboBoxSearchInput"]') as HTMLInputElement

    fireEvent.change(screen.getByTestId('index-name'), { target: { value: 'index' } })
    fireEvent.change(
      comboboxInput,
      { target: { value: 'val1' } }
    )

    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 13, charCode: 13 })

    fireEvent.click(screen.getByTestId('key-type'))
    fireEvent.click(queryByText('JSON') || document)

    fireEvent.change(screen.getByTestId('identifier-0'), { target: { value: 'identifier' } })

    fireEvent.click(screen.getByTestId('field-type-0'))
    fireEvent.click(queryByText('GEO') || document)

    expect(screen.getByTestId('index-name')).toHaveValue('index')
    expect(screen.getByTestId('key-type')).toHaveTextContent('JSON')
    expect(containerLabels.querySelector('[title="val1"]')).toBeInTheDocument()
    expect(screen.getByTestId('identifier-0')).toHaveValue('identifier')
    expect(screen.getByTestId('field-type-0')).toHaveTextContent('GEO')
  })

  it('should render Identifier popover button ', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    expect(screen.getByTestId('identifier-info-icon')).toBeInTheDocument()
  })

  it('should not have geoshape option', () => {
    const { queryByText } = render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    fireEvent.click(screen.getByTestId('field-type-0'))

    expect(queryByText('GEOSHAPE')).not.toBeInTheDocument()
    expect(queryByText('VECTOR')).not.toBeInTheDocument()
  })
})
