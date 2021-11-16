import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import SentinelDatabasesResultPage from './SentinelDatabasesResultPage'

jest.mock('uiSrc/slices/sentinel', () => ({
  sentinelSelector: jest.fn().mockReturnValue({
    data: [{
      status: 'success',
      name: 'mymaster',
      host: 'localhost',
      port: 6379,
      alias: 'alias',
      numberOfSlaves: 0,
    }]
  }),
  createMastersSentinelAction: () => jest.fn(),
  resetLoadedSentinel: () => jest.fn,
  updateMastersSentinel: () => jest.fn(),
  resetDataSentinel: jest.fn
}))

describe('SentinelDatabasesResultPage', () => {
  it('should render', () => {
    expect(render(<SentinelDatabasesResultPage />)).toBeTruthy()
  })
})
