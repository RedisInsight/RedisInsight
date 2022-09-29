import React from 'react'
import reactRouterDom from 'react-router-dom'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AnalyticsTabs from './AnalyticsTabs'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

/**
 * StreamTabs tests
 *
 * @group unit
 */
describe('StreamTabs', () => {
  it('should render', () => {
    expect(render(<AnalyticsTabs />)).toBeTruthy()
  })

  it('click on clusterDetails tab should call History push with /cluster-details path ', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<AnalyticsTabs />)

    await act(() => {
      fireEvent.click(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.ClusterDetails}`))
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/analytics/cluster-details')
  })
  it('click on SlowLog tab should call History push with /slowlog path ', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<AnalyticsTabs />)

    await act(() => {
      fireEvent.click(screen.getByTestId(`analytics-tab-${AnalyticsViewTab.SlowLog}`))
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/instanceId/analytics/slowlog')
  })
})
