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
    // connectedInstanceSelector.mockImplementation(() => ({
    //   id: '123',
    //   connectionType: 'CLUSTER',
    // }));

    // const sendCliClusterActionMock = jest.fn();

    // sendCliClusterCommandAction.mockImplementation(() => sendCliClusterActionMock);

    expect(render(<QueryCardCliResult {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Result element should render with result prop', () => {
    const result = '123'

    const { queryByTestId } = render(
      <QueryCardCliResult {...instance(mockedProps)} result={result} />
    )

    const resultEl = queryByTestId(resultTestId)

    expect(resultEl).toBeInTheDocument()
    expect(resultEl).toHaveTextContent(result)
  })

  it('Result element should render (nil) result', () => {
    const result = ''

    const { queryByTestId } = render(
      <QueryCardCliResult {...instance(mockedProps)} result={result} />
    )

    const resultEl = queryByTestId(resultTestId)

    expect(resultEl).toHaveTextContent('(nil)')
  })
})
