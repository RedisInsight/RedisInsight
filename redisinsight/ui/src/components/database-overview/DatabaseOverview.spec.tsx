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
  it('should render', () => {
    expect(render(
      <DatabaseOverview metrics={overviewMetrics} />
    )).toBeTruthy()
  })
})
