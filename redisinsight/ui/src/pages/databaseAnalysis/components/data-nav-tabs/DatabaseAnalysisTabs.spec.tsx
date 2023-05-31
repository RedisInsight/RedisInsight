import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { MOCK_ANALYSIS_REPORT_DATA } from 'uiSrc/mocks/data/analysis'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import { render, screen, mockedStore, cleanup, fireEvent } from 'uiSrc/utils/test-utils'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import { setDatabaseAnalysisViewTab } from 'uiSrc/slices/analytics/dbAnalysis'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import DatabaseAnalysisTabs, { Props } from './DatabaseAnalysisTabs'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedProps = mock<Props>()

const mockReports = [
  {
    id: MOCK_ANALYSIS_REPORT_DATA.id,
    createdAt: '2022-09-23T05:30:23.000Z'
  }
]

let store: typeof mockedStore

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    provider: 'RE_CLOUD',
  }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DatabaseAnalysisTabs', () => {
  it('should render', () => {
    expect(render(<DatabaseAnalysisTabs {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call setDatabaseAnalysisViewTab', () => {
    render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} />)

    fireEvent.click(screen.getByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`))

    const expectedActions = [setDatabaseAnalysisViewTab(DatabaseAnalysisViewTab.Recommendations)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render encrypt message', () => {
    const mockData = {
      totalKeys: null
    }
    render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

    expect(screen.queryByTestId('empty-encrypt-wrapper')).toBeTruthy()
  })

  describe('recommendations count', () => {
    it('should render "Recommendation (3)" in the tab name', () => {
      const mockData = {
        recommendations: [
          { name: 'luaScript' },
          { name: 'luaScript' },
          { name: 'luaScript' },
        ]
      }

      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      expect(screen.queryByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`)).toHaveTextContent('Recommendations (3)')
    })

    it('should render "Recommendation (3)" in the tab name', () => {
      const mockData = {
        recommendations: [{ name: 'luaScript' }]
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      expect(screen.queryByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`)).toHaveTextContent('Recommendations (1)')
    })

    it('should render "Recommendation" in the tab name', () => {
      const mockData = {
        recommendations: []
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      expect(screen.queryByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`)).toHaveTextContent('Recommendations')
    })
  })

  describe('Telemetry', () => {
    it('should call DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED telemetry event with 0 count', () => {
      const sendEventTelemetryMock = jest.fn()
      sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

      const mockData = {
        recommendations: []
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      fireEvent.click(screen.getByTestId(`${DatabaseAnalysisViewTab.DataSummary}-tab`))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          provider: 'RE_CLOUD',
        }
      })
      sendEventTelemetry.mockRestore()
    })

    it('should call DATABASE_ANALYSIS_RECOMMENDATIONS_CLICKED telemetry event with 0 count', () => {
      const sendEventTelemetryMock = jest.fn()
      sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

      const mockData = {
        recommendations: []
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      fireEvent.click(screen.getByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          recommendationsCount: 0,
          list: [],
          provider: 'RE_CLOUD'
        }
      })
      sendEventTelemetry.mockRestore()
    })

    it('should call DATABASE_ANALYSIS_RECOMMENDATIONS_CLICKED telemetry event with 2 count', () => {
      const sendEventTelemetryMock = jest.fn()
      sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

      const mockData = {
        recommendations: [{ name: 'luaScript' }, { name: 'bigHashes' }]
      }
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} data={mockData} />)

      fireEvent.click(screen.getByTestId(`${DatabaseAnalysisViewTab.Recommendations}-tab`))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_RECOMMENDATIONS_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          recommendationsCount: 2,
          list: ['luaScript', 'shardHashes'],
          provider: 'RE_CLOUD'
        }
      })
      sendEventTelemetry.mockRestore()
    })
  })
})
