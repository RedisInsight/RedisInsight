import React from 'react'
import reactRouterDom from 'react-router-dom'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import AnalyticsTabs from './AnalyticsTabs'

const mockedStandaloneConnection = ConnectionType.Standalone
jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    connectionType: mockedStandaloneConnection
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

describe('AnalyticsTabs', () => {
  it('should render', () => {
    expect(render(<AnalyticsTabs />)).toBeTruthy()
  })

  it('should call History push with /database-analysis path when click on DatabaseAnalysis tab', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<AnalyticsTabs />)

    await act(() => {
      fireEvent.click(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.DatabaseAnalysis}`))
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/analytics/database-analysis')
  })
  it('should call History push with /slowlog path when click on SlowLog tab', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<AnalyticsTabs />)

    await act(() => {
      fireEvent.click(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.SlowLog}`))
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/analytics/slowlog')
  })

  it('should render cluster details tab when connectionType is Cluster', async () => {
    const mockConnectionType = ConnectionType.Cluster;
    (connectedInstanceSelector as jest.Mock).mockReturnValueOnce({
      connectionType: mockConnectionType
    })

    render(<AnalyticsTabs />)

    expect(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.ClusterDetails}`)).toBeInTheDocument()
  })

  it('should not render cluster details tab when connectionType is not Cluster', async () => {
    const { queryByTestId } = render(<AnalyticsTabs />)

    expect(queryByTestId(`analytics-tab-${AnalyticsViewTab.ClusterDetails}`)).not.toBeInTheDocument()
  })

  it('should call History push with /cluster-details path when click on ClusterDetails tab ', async () => {
    const mockConnectionType = ConnectionType.Cluster;
    (connectedInstanceSelector as jest.Mock).mockReturnValueOnce({
      connectionType: mockConnectionType
    })
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<AnalyticsTabs />)

    await act(() => {
      fireEvent.click(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.ClusterDetails}`))
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/analytics/cluster-details')
  })
})
