import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'
import { cleanup, clearStoreActions, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
import QueryCard, { Props } from './QueryCard'

const mockedProps = mock<Props>()

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

jest.mock('uiSrc/slices/app/plugins', () => ({
  ...jest.requireActual('uiSrc/slices/app/plugins'),
  appPluginsSelector: jest.fn().mockReturnValue({
    visualizations: []
  }),
}))

describe('QueryCard', () => {
  it('should render', () => {
    expect(render(<QueryCard {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('Cli result should not in the document before Expand', () => {
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = render(<QueryCard {...instance(mockedProps)} />)

    const cliResultEl = queryByTestId(cliResultTestId)
    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Cli result should in the document when "isOpen = true"', () => {
    const cliResultTestId = 'query-cli-result'

    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    const { queryByTestId } = render(<QueryCard
      {...instance(mockedProps)}
      isOpen
      result={mockResult}
    />)

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).toBeInTheDocument()
  })

  it('Cli result should not in the document when "isOpen = true"', () => {
    const cliResultTestId = 'query-cli-result'

    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    const { queryByTestId } = render(<QueryCard
      {...instance(mockedProps)}
      isOpen={false}
      result={mockResult}
    />)

    const cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).not.toBeInTheDocument()
  })

  it('Click on the header should call toggleOpenWBResult', () => {
    const cardHeaderTestId = 'query-card-open'
    const mockId = '123'

    const mockResult = [{
      response: 'response',
      status: 'success'
    }]

    const { queryByTestId } = render(<QueryCard
      {...instance(mockedProps)}
      id={mockId}
      result={mockResult}
    />)

    const cardHeaderTestEl = queryByTestId(cardHeaderTestId)

    fireEvent.click(cardHeaderTestEl)

    const expectedActions = [toggleOpenWBResult(mockId)]
    expect(clearStoreActions(store.getActions().slice(0, expectedActions.length))).toEqual(
      clearStoreActions(expectedActions)
    )
  })
})
