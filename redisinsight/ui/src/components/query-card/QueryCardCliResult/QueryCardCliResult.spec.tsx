import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import QueryCardCliResult, { Props } from './QueryCardCliResult'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const resultTestId = 'query-cli-result'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('QueryCardCliResult', () => {
  it('should render', () => {
    expect(render(<QueryCardCliResult {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Result element should render with result prop', () => {
    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    const { queryByTestId } = render(
      <QueryCardCliResult {...instance(mockedProps)} result={mockResult} />
    )

    const resultEl = queryByTestId(resultTestId)

    expect(resultEl).toBeInTheDocument()
    expect(resultEl).toHaveTextContent(mockResult?.[0]?.response)
  })

  it('Result element should render (nil) result', () => {
    const mockResult = [{
      response: '',
      status: 'success'
    }]

    const { queryByTestId } = render(
      <QueryCardCliResult {...instance(mockedProps)} result={mockResult} />
    )

    const resultEl = queryByTestId(resultTestId)

    expect(resultEl).toHaveTextContent('(nil)')
  })
})
