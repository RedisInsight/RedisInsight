import { cloneDeep } from 'lodash'
import React from 'react'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { rdiStatisticsSelector } from 'uiSrc/slices/rdi/statistics'
import { TelemetryEvent, TelemetryPageView, sendEventTelemetry, sendPageViewTelemetry } from 'uiSrc/telemetry'
import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import StatisticsPage from './StatisticsPage'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name'
  })
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {
      config: 'config',
      jobs: []
    }
  })
}))

jest.mock('uiSrc/slices/rdi/statistics', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/statistics'),
  rdiStatisticsSelector: jest.fn().mockReturnValue({
    loading: false,
    results: {
      data: {
        connections: {
          Connection1: {
            status: 'good',
            type: 'type1',
            host: 'Redis-Stack-in-Redis-Enterprise-Cloud',
            port: 12000,
            database: 'admin',
            user: 'admin'
          }
        },
        dataStreams: {
          Stream1: {
            total: 35,
            pending: 2,
            inserted: 2530,
            updated: 65165,
            deleted: 1,
            filtered: 0,
            rejected: 5,
            deduplicated: 0,
            lastArrival: '1 Hour'
          }
        },
        processingPerformance: {
          totalBatches: 3427,
          batchSizeAvg: '0.93',
          readTimeAvg: '13',
          processTimeAvg: '24',
          ackTimeAvg: '6.2',
          totalTimeAvg: '6.1',
          recPerSecAvg: 110
        },
        rdiPipelineStatus: {
          rdiVersion: '2.0',
          address: '172.17.0.2:12006',
          runStatus: 'Started',
          syncMode: 'Streaming'
        },
        clients: {
          9875: {
            addr: '172.16.0.2:62356',
            name: 'redis-di-cli',
            ageSec: 100,
            idleSec: 2,
            user: 'default'
          }
        }
      }
    }
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn()
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions();
  (sendEventTelemetry as jest.Mock).mockRestore()
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
    (rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      data: {}
    })
    const { getByText } = render(<StatisticsPage />)
    expect(getByText('No pipeline deployed yet')).toBeInTheDocument()
  })

  it('should call proper telemetry on page view', () => {
    render(<StatisticsPage />)

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_STATUS
    })
  })

  it('should call proper telemetry event when refresh is clicked for processing performance section', () => {
    render(<StatisticsPage />)

    fireEvent.click(screen.getByTestId('processing-performance-info-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'processing_performance'
      }
    })
  })

  it('should call proper telemetry event when refresh is clicked for data streams section', () => {
    render(<StatisticsPage />)

    fireEvent.click(screen.getByTestId('data-streams-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'data_streams'
      }
    })
  })

  it('should call proper telemetry event when refresh is clicked for clients section', () => {
    render(<StatisticsPage />)

    fireEvent.click(screen.getByTestId('clients-refresh-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_REFRESH_CLICKED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'clients'
      }
    })
  })

  it('should call proper telemetry event when auto refresh is disabled for processing performance section', async () => {
    render(<StatisticsPage />)

    const testid = 'processing-performance-info'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'processing_performance',
        enableAutoRefresh: false,
        refreshRate: '5.0'
      }
    })
  })

  it('should call proper telemetry event when auto refresh is enabled for processing performance section', async () => {
    render(<StatisticsPage />)

    const testid = 'processing-performance-info'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'processing_performance',
        enableAutoRefresh: true,
        refreshRate: '5.0'
      }
    })
  })

  it('should call proper telemetry event when auto refresh is enabled for data streams section', async () => {
    render(<StatisticsPage />)

    const testid = 'data-streams'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'data_streams',
        enableAutoRefresh: true,
        refreshRate: '5.0'
      }
    })
  })

  it('should call proper telemetry event when auto refresh is disabled for data streams section', async () => {
    render(<StatisticsPage />)

    const testid = 'data-streams'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'data_streams',
        enableAutoRefresh: false,
        refreshRate: '5.0'
      }
    })
  })

  it('should call proper telemetry event when auto refresh is enabled for clients section', async () => {
    render(<StatisticsPage />)

    const testid = 'clients'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_ENABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'clients',
        enableAutoRefresh: true,
        refreshRate: '5.0'
      }
    })
  })

  it('should call proper telemetry event when auto refresh is disabled for clients section', async () => {
    render(<StatisticsPage />)

    const testid = 'clients'

    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-config-btn`))
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // enabled
    fireEvent.click(screen.getByTestId(`${testid}-auto-refresh-switch`)) // disabled

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_STATISTICS_AUTO_REFRESH_DISABLED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        section: 'clients',
        enableAutoRefresh: false,
        refreshRate: '5.0'
      }
    })
  })
})
