import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import { getOverviewMetrics } from './components/OverviewMetrics'
import DatabaseOverview from './DatabaseOverview'

const overviewMetrics = getOverviewMetrics({
  theme: 'DARK',
  items: {
    version: '6.0.0',
    usedMemory: 100,
    totalKeys: 5000,
    connectedClients: 1,
    cpuUsagePercentage: 0.23,
    networkInKbps: 3,
    networkOutKbps: 5,
    opsPerSecond: 10
  }
})

describe('DatabaseOverview', () => {
  const mockLoadData = jest.fn()
  const mockHandleEnableAutoRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with metrics', () => {
    const { container } = render(
      <DatabaseOverview
        metrics={overviewMetrics}
        loadData={mockLoadData}
        lastRefreshTime={null}
        handleEnableAutoRefresh={mockHandleEnableAutoRefresh}
      />
    )

    expect(container.querySelector('[data-test-subj="overview-cpu"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-commands-sec"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-total-memory"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-total-keys"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-connected-clients"]')).toBeInTheDocument()
  })

  it('should render auto-refresh component', () => {
    const { container } = render(
      <DatabaseOverview
        metrics={overviewMetrics}
        loadData={mockLoadData}
        lastRefreshTime={Date.now()}
        handleEnableAutoRefresh={mockHandleEnableAutoRefresh}
      />
    )

    expect(container.querySelector('[data-testid="auto-refresh-overview-auto-refresh-container"]')).toBeInTheDocument()
  })

  it('should not render anything when metrics are empty', () => {
    const { container } = render(
      <DatabaseOverview
        metrics={[]}
        loadData={mockLoadData}
        lastRefreshTime={null}
        handleEnableAutoRefresh={mockHandleEnableAutoRefresh}
      />
    )

    expect(container.firstChild?.childNodes.length).toBe(0)
  })
})
