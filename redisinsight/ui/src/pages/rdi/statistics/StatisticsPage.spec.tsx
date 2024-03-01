import { cloneDeep } from 'lodash'
import React from 'react'

import { rdiStatisticsSelector } from 'uiSrc/slices/rdi/statistics'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import StatisticsPage from './StatisticsPage'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name'
  })
}))

jest.mock('uiSrc/slices/rdi/statistics', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/statistics'),
  rdiStatisticsSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {
      rdiPipelineStatus: {
        status: 'status',
        lastUpdated: 'lastUpdated',
        lastUpdatedTimestamp: 123
      },
      processingPerformance: {
        lastUpdated: 'lastUpdated',
        lastUpdatedTimestamp: 123,
        performance: {
          total: 123,
          successful: 123,
          failed: 123,
          processingTime: 123
        }
      }
    }
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('StatisticsPage', () => {
  it('should render', () => {
    expect(render(<StatisticsPage />)).toBeTruthy()
  })

  it('renders the page with correct title', () => {
    render(<StatisticsPage />)
    expect(document.title).toBe('name - Pipeline Status')
  })

  it('renders null when statisticsData is not available', () => {
    (rdiStatisticsSelector as jest.Mock).mockReturnValueOnce({
      data: null
    })
    const { container } = render(<StatisticsPage />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the empty state when pipeline data is empty', () => {
    const { getByText } = render(<StatisticsPage />)
    expect(getByText('No pipeline deployed yet')).toBeInTheDocument()
  })
})
