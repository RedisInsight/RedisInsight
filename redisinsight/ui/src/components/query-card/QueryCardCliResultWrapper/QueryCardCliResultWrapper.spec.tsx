import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import QueryCardCliResult, { Props, resultTestId, loaderTestId, warningTestId } from './QueryCardCliResultWrapper'
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

  it('should render QueryCardCliDefaultResult', () => {
    expect(render(<QueryCardCliDefaultResult {...instance(mockedQueryCardCliDefaultResultProps)} />)).toBeTruthy()
  })

  it('should render QueryCardCliGroupResult', () => {
    const mockResult = [{
      response: ['response'],
      status: 'success'
    }]

    render(
      <QueryCardCliResult {...instance(mockedProps)} resultsMode={ResultsMode.GroupMode} result={mockResult} />
    )

    expect(render(<QueryCardCliGroupResult {...instance(mockedQueryCardCliGroupResultProps)} />)).toBeTruthy()
  })

  it('should render QueryCardCliDefaultResult when result.response is not array', () => {
    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    render(
      <QueryCardCliResult {...instance(mockedProps)} resultsMode={ResultsMode.GroupMode} result={mockResult} />
    )

    expect(render(<QueryCardCliDefaultResult {...instance(mockedQueryCardCliDefaultResultProps)} />)).toBeTruthy()
  })

  it('Should render loader', () => {
    const { queryByTestId } = render(
      <QueryCardCliResult {...instance(mockedProps)} loading />
    )

    const loader = queryByTestId(loaderTestId)

    expect(loader).toBeInTheDocument()
  })

  it('should render warning', () => {
    const mockResult = [{
      response: 'response',
      status: 'success',
      isNotStored: true
    }]

    const { queryByTestId } = render(
      <QueryCardCliResult {...instance(mockedProps)} result={mockResult} />
    )

    const warning = queryByTestId(warningTestId)

    expect(warning).toBeInTheDocument()
  })
})
