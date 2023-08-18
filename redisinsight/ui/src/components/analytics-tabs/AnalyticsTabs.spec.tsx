import React from 'react'
import { useSelector } from 'react-redux'
import reactRouterDom from 'react-router-dom'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { RootState, store } from 'uiSrc/slices/store'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AnalyticsTabs from './AnalyticsTabs'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

beforeEach(() => {
  const state: RootState = store.getState();

  (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
    ...state,
    analytics: {
      ...state.analytics
    },
    connections: {
      ...state.connections
    }
  }))
})

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
    const state: RootState = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      connections: {
        ...state.connections,
        instances: {
          ...state.connections.instances,
          connectedInstance: {
            ...state.connections.instances.connectedInstance,
            connectionType: ConnectionType.Cluster
          }
        },
      }
    }))

    render(<AnalyticsTabs />)

    expect(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.ClusterDetails}`)).toBeInTheDocument()
  })

  it('should not render cluster details tab when connectionType is not Cluster', async () => {
    const state: RootState = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      connections: {
        ...state.connections,
        instances: {
          ...state.connections.instances,
          connectedInstance: {
            ...state.connections.instances.connectedInstance,
            connectionType: ConnectionType.Standalone
          }
        },
      }
    }))

    const { queryByTestId } = render(<AnalyticsTabs />)

    expect(queryByTestId(`analytics-tab-${AnalyticsViewTab.ClusterDetails}`)).not.toBeInTheDocument()
  })

  it('should call History push with /cluster-details path when click on ClusterDetails tab ', async () => {
    const state: RootState = store.getState();

    (useSelector as jest.Mock).mockImplementation((callback: (arg0: RootState) => RootState) => callback({
      ...state,
      connections: {
        ...state.connections,
        instances: {
          ...state.connections.instances,
          connectedInstance: {
            ...state.connections.instances.connectedInstance,
            connectionType: ConnectionType.Cluster
          }
        },
      }
    }))
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
