import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import QueryCardCliResultWrapper, { Props } from './QueryCardCliResultWrapper'
import QueryCardCliDefaultResult, { Props as QueryCardCliDefaultResultProps } from '../QueryCardCliDefaultResult'
import QueryCardCliGroupResult, { Props as QueryCardCliGroupResultProps } from '../QueryCardCliGroupResult'

const mockedProps = mock<Props>()
const mockedQueryCardCliDefaultResultProps = mock<QueryCardCliDefaultResultProps>()
const mockedQueryCardCliGroupResultProps = mock<QueryCardCliGroupResultProps>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('QueryCardCliResultWrapper', () => {
  it('should render', () => {
    expect(render(<QueryCardCliResultWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Result element should render with result prop', () => {
    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    const { queryByTestId } = render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} result={mockResult} />
    )

    const resultEl = queryByTestId('query-cli-result')

    expect(resultEl).toBeInTheDocument()
    expect(resultEl).toHaveTextContent(mockResult?.[0]?.response)
  })

  it('Result element should render (nil) result', () => {
    const mockResult = [{
      response: '',
      status: 'success'
    }]

    const { queryByTestId } = render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} result={mockResult} />
    )

    const resultEl = queryByTestId('query-cli-result')

    expect(resultEl).toHaveTextContent('(nil)')
  })

  it('should render QueryCardCliDefaultResult', () => {
    expect(render(<QueryCardCliDefaultResult {...instance(mockedQueryCardCliDefaultResultProps)} />)).toBeTruthy()
  })

  it('should render QueryCardCliGroupResult', () => {
    const mockResult = [{
      response: ['response'],
      status: 'success'
    }]

    render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} resultsMode={ResultsMode.GroupMode} result={mockResult} />
    )

    expect(render(<QueryCardCliGroupResult {...instance(mockedQueryCardCliGroupResultProps)} />)).toBeTruthy()
  })

  it('should render QueryCardCliDefaultResult when result.response is not array', () => {
    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} resultsMode={ResultsMode.GroupMode} result={mockResult} />
    )

    expect(render(<QueryCardCliDefaultResult {...instance(mockedQueryCardCliDefaultResultProps)} />)).toBeTruthy()
  })

  it('Should render loader', () => {
    const { queryByTestId } = render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} loading />
    )

    const loader = queryByTestId('query-cli-loader')

    expect(loader).toBeInTheDocument()
  })

  it('should render warning', () => {
    const { queryByTestId } = render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} isNotStored />
    )

    const warning = queryByTestId('query-cli-warning')

    expect(warning).toBeInTheDocument()
  })
})
