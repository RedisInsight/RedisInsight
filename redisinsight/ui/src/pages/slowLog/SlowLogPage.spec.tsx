import React from 'react'
import { slowLogSelector } from 'uiSrc/slices/slowlog/slowlog'
import { render, screen } from 'uiSrc/utils/test-utils'

import SlowLogPage from './SlowLogPage'

jest.mock('uiSrc/slices/slowlog/slowlog', () => ({
  ...jest.requireActual('uiSrc/slices/slowlog/slowlog'),
  slowLogSelector: jest.fn().mockReturnValue({
    data: [],
    config: null,
    loading: false,
  }),
}))

const mockedData = [
  {
    id: 0,
    time: 1652429583,
    durationUs: 56,
    args: 'info',
    source: '0.0.0.1:50834',
    client: 'redisinsight-common-0'
  },
  {
    id: 1,
    time: 1652429583,
    durationUs: 11,
    args: 'config get slowlog*',
    source: '0.0.0.1:50834',
    client: 'redisinsight-common-0'
  }
]

describe('SlowLogPage', () => {
  it('should render', () => {
    expect(render(<SlowLogPage />)).toBeTruthy()
  })

  it('should render empty slow log with empty data', () => {
    (slowLogSelector as jest.Mock).mockImplementation(() => ({
      data: [],
      config: null,
      loading: false,
    }))

    render(<SlowLogPage />)
    expect(screen.getByTestId('empty-slow-log')).toBeTruthy()
  })

  it('should render slow log table with mocked data', () => {
    (slowLogSelector as jest.Mock).mockImplementation(() => ({
      data: mockedData,
      config: null,
      loading: false,
    }))

    render(<SlowLogPage />)
    expect(screen.getByTestId('slowlog-table')).toBeTruthy()
  })
})
