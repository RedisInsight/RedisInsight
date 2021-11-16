import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import { getOverviewItems } from './components/OverviewItems'
import DatabaseOverview from './DatabaseOverview'

const overviewItemsMock = getOverviewItems({
  theme: 'DARK',
  items: {
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
      <DatabaseOverview
        maxLength={5}
        items={overviewItemsMock}
      />
    )).toBeTruthy()
  })
})
