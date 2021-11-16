import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import ModuleNotLoaded from './ModuleNotLoaded'
import { RSNotLoadedContent } from '../../constants'

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

describe('ModuleNotLoaded', () => {
  it('should render', () => {
    expect(render(<ModuleNotLoaded content={RSNotLoadedContent} />)).toBeTruthy()
  })

  it('"output" prop should render', () => {
    const { queryByTestId } = render(<ModuleNotLoaded content={RSNotLoadedContent} />)

    const outputEl = queryByTestId('query-card-no-module-output')
    expect(outputEl).toBeInTheDocument()
  })
  it('"table" prop should render', () => {
    const { container } = render(<ModuleNotLoaded content={RSNotLoadedContent} />)

    const tableEl = container.querySelector('[data-test-subj="query-card-no-module-table"]')
    expect(tableEl).toBeInTheDocument()
  })
  it('"createCloudBtn" prop should render', () => {
    const { queryByTestId } = render(<ModuleNotLoaded content={RSNotLoadedContent} />)

    const btnEl = queryByTestId('query-card-no-module-button')
    expect(btnEl).toBeInTheDocument()
  })
  it('"summaryText" prop should render', () => {
    const { queryByTestId } = render(<ModuleNotLoaded content={RSNotLoadedContent} />)

    const summaryTextEl = queryByTestId('query-card-no-module-summary-text')
    expect(summaryTextEl).toBeInTheDocument()
  })
  it('"summaryImgPath" prop should render', () => {
    const { queryByTestId } = render(<ModuleNotLoaded content={RSNotLoadedContent} />)

    const summaryImgEl = queryByTestId('query-card-no-module-summary-img')
    expect(summaryImgEl).toBeInTheDocument()
  })
})
