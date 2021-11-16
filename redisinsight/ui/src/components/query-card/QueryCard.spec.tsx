import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, fireEvent, mockedStore, render } from 'uiSrc/utils/test-utils'
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

  it.only('Cli result should in the document after Expand', () => {
    const cardHeaderTestId = 'query-card-open'
    const cliResultTestId = 'query-cli-result'

    const { queryByTestId } = render(<QueryCard
      {...instance(mockedProps)}
      fromStore
      data="results"
    />)

    const cardHeaderTestEl = queryByTestId(cardHeaderTestId)
    let cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).not.toBeInTheDocument()

    fireEvent.click(cardHeaderTestEl)

    cliResultEl = queryByTestId(cliResultTestId)

    expect(cliResultEl).toBeInTheDocument()
  })
})
