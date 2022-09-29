import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
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

/**
 * QueryCardCliResultWrapper tests
 *
 * @group unit
 */
describe('QueryCardCliResultWrapper', () => {
  it('should render', () => {
    expect(render(<QueryCardCliResultWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Result element should render with result prop', () => {
    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} result={mockResult} />
    )

    expect(screen.queryByTestId('query-cli-result')).toBeInTheDocument()
    expect(screen.queryByTestId('query-cli-result')).toHaveTextContent(mockResult?.[0]?.response)
  })

  it('Result element should render (nil) result', () => {
    const mockResult = [{
      response: '',
      status: 'success'
    }]

    render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} result={mockResult} />
    )

    expect(screen.queryByTestId('query-cli-result')).toHaveTextContent('(nil)')
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
    render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} loading />
    )

    expect(screen.queryByTestId('query-cli-loader')).toBeInTheDocument()
  })

  it('should render warning', () => {
    render(
      <QueryCardCliResultWrapper {...instance(mockedProps)} isNotStored />
    )

    expect(screen.queryByTestId('query-cli-warning')).toBeInTheDocument()
  })
})
