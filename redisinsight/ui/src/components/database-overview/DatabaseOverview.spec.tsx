import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  KeyLightIcon,
  MeasureLightIcon,
  MemoryLightIcon,
  TimeLightIcon,
  UserLightIcon,
} from 'uiSrc/components/database-overview/components/icons'
import { truncateNumberToRange } from 'uiSrc/utils'
import DatabaseOverview from './DatabaseOverview'
import { useDatabaseOverview } from './hooks/useDatabaseOverview'
import { IMetric } from './components/OverviewMetrics'
import styles from './styles.module.scss'

// Mock the useDatabaseOverview hook
jest.mock('./hooks/useDatabaseOverview')

// Mock the config
jest.mock('uiSrc/config', () => ({
  getConfig: jest.fn(() => {
    const { getConfig: actualGetConfig } = jest.requireActual('uiSrc/config')
    const actualConfig = actualGetConfig()
    return {
      ...actualConfig,
      app: {
        ...actualConfig.app,
        returnUrlBase: 'https://redis.cloud.io/#',
      },
    }
  }),
}))

// Create mock metrics for testing
const mockMetrics: IMetric[] = [
  {
    id: 'overview-cpu',
    title: 'CPU',
    value: 5,
    loading: 5 === null,
    unavailableText: 'CPU is not available',
    icon: TimeLightIcon,
    className: styles.cpuWrapper,
    content: '5 %',
    tooltip: {
      title: 'CPU',
      icon: TimeLightIcon,
      content: (
        <>
          <b>5</b>
          &nbsp;%
        </>
      ),
    },
  },
  {
    id: 'overview-total-memory',
    value: 13,
    unavailableText: 'Total Memory is not available',
    title: 'Total Memory',
    tooltip: {
      title: 'Total Memory',
      icon: MemoryLightIcon,
      content: '13 / 30 (43%)',
    },
    icon: MemoryLightIcon,
    content: (
      <span>
        13 / <strong>30</strong> (43%)
      </span>
    ),
  },
  {
    id: 'overview-total-keys',
    value: 5000,
    unavailableText: 'Total Keys are not available',
    title: 'Total Keys',
    icon: KeyLightIcon,
    content: truncateNumberToRange(5000),
    tooltip: {
      icon: KeyLightIcon,
      content: <b>5 000</b>,
      title: 'Total Keys',
    },
    children: [
      {
        id: 'total-keys-tip',
        value: 5000,
        unavailableText: 'Total Keys are not available',
        title: 'Total Keys',
        tooltip: {
          title: 'Total Keys',
          content: <b>5 000</b>,
        },
        content: <b>5 000</b>,
      },
      {
        id: 'overview-db-total-keys',
        title: 'Keys',
        value: 3000,
        content: (
          <>
            <span
              style={{
                fontWeight: 200,
                paddingRight: 1,
              }}
            >
              db0:
            </span>
            <b>3 000</b>
          </>
        ),
      },
    ],
  },
  {
    id: 'overview-connected-clients',
    value: 3,
    unavailableText: 'Connected Clients are not available',
    title: 'Connected Clients',
    tooltip: {
      title: 'Connected Clients',
      content: <b>3</b>,
      icon: UserLightIcon,
    },
    icon: UserLightIcon,
    content: 3,
  },
  {
    id: 'overview-commands-sec',
    icon: MeasureLightIcon,
    content: 5,
    value: 5,
    unavailableText: 'Commands/s are not available',
    title: 'Commands/s',
    tooltip: {
      icon: MeasureLightIcon,
      content: 5,
    },
    className: styles.opsPerSecItem,
    children: [
      {
        id: 'commands-per-sec-tip',
        title: 'Commands/s',
        icon: MeasureLightIcon,
        value: 5,
        content: 5,
        unavailableText: 'Commands/s are not available',
      },
    ],
  },
]

// Create a default mock implementation for the hook
const defaultMockHook = {
  metrics: mockMetrics,
  connectivityError: null,
  lastRefreshTime: Date.now(),
  subscriptionType: undefined,
  subscriptionId: undefined,
  isBdbPackages: undefined,
  usedMemoryPercent: undefined,
  handleEnableAutoRefresh: jest.fn(),
  handleRefresh: jest.fn(),
  handleRefreshClick: jest.fn(),
}

describe('DatabaseOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set the default mock implementation
    ;(useDatabaseOverview as jest.Mock).mockReturnValue(defaultMockHook)
  })

  it('should render with metrics', () => {
    render(<DatabaseOverview />)

    expect(screen.getByTestId('overview-cpu')).toBeInTheDocument()
    expect(screen.getByTestId('overview-commands-sec')).toBeInTheDocument()
    expect(screen.getByTestId('overview-total-memory')).toHaveTextContent(
      '45 MB',
    )
    expect(screen.getByTestId('overview-total-keys')).toBeInTheDocument()
    expect(screen.getByTestId('overview-connected-clients')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade-ri-db-button')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Upgrade plan' }),
    ).not.toBeInTheDocument()
  })

  it('should render auto-refresh component', () => {
    render(<DatabaseOverview />)

    expect(
      screen.getByTestId('auto-refresh-overview-auto-refresh-container'),
    ).toBeInTheDocument()
  })

  it('should show upgrade button and memory usage percentage if cloud plan limit is present', () => {
    // Mock the hook with subscription data
    const mockWithSubscription = {
      ...defaultMockHook,
      metrics: mockMetrics.map((m) => {
        if (m.id === 'overview-total-memory') {
          return {
            ...m,
            value: '45 MB / 75 MB (60.3%)',
            tooltip: {
              ...m.tooltip,
              content: '45 MB / 75 MB (60.3%)',
            },
          }
        }
        return m
      }),
      subscriptionType: 'fixed',
      subscriptionId: 123,
      usedMemoryPercent: 60.3,
    }
    ;(useDatabaseOverview as jest.Mock).mockReturnValue(mockWithSubscription)

    const { getByTestId, getByRole } = render(<DatabaseOverview />)

    expect(getByTestId('overview-total-memory')).toHaveTextContent(
      '45 MB / 75 MB (60.3%)',
    )
    expect(getByRole('button', { name: 'Upgrade plan' })).toBeInTheDocument()
  })

  it('should not show upgrade button for flexible subscriptions', () => {
    // Mock the hook with flexible subscription data
    const mockWithFlexibleSubscription = {
      ...defaultMockHook,
      metrics: [
        ...mockMetrics.slice(0, 1),
        {
          id: 'memory',
          title: 'Memory',
          value: '45 MB / 75 MB (60.3%)',
          tooltip: { content: '45 MB / 75 MB (60.3%)', title: 'Used Memory' },
        },
        ...mockMetrics.slice(2),
      ],
      subscriptionType: 'flexible',
      subscriptionId: 123,
      usedMemoryPercent: 60.3,
    }
    ;(useDatabaseOverview as jest.Mock).mockReturnValue(
      mockWithFlexibleSubscription,
    )

    render(<DatabaseOverview />)

    expect(screen.getByTestId('overview-total-memory')).toHaveTextContent(
      '45 MB / 75 MB (60.3%)',
    )
    expect(
      screen.queryByRole('button', { name: 'Upgrade plan' }),
    ).not.toBeInTheDocument()
  })

  test.each([
    ['https://redis.cloud.io/#/subscription/123/change-plan', false],
    ['https://redis.cloud.io/#/databases/upgrade/123', true],
  ])('should redirect to %s when isBdbPackages = %s', (url, isBdbPackages) => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)

    // Mock the hook with subscription data and isBdbPackages flag
    const mockWithBdbPackages = {
      ...defaultMockHook,
      metrics: [
        ...mockMetrics.slice(0, 1),
        {
          id: 'memory',
          title: 'Memory',
          value: '45 MB / 75 MB (60.3%)',
          tooltip: { content: '45 MB / 75 MB (60.3%)', title: 'Used Memory' },
        },
        ...mockMetrics.slice(2),
      ],
      subscriptionType: 'fixed',
      subscriptionId: 123,
      isBdbPackages,
      usedMemoryPercent: 60.3,
    }
    ;(useDatabaseOverview as jest.Mock).mockReturnValue(mockWithBdbPackages)

    render(<DatabaseOverview />)

    expect(screen.getByTestId('overview-total-memory')).toHaveTextContent(
      '45 MB / 75 MB (60.3%)',
    )
    const upgradeBtn = screen.getByRole('button', { name: 'Upgrade plan' })
    expect(upgradeBtn).toBeInTheDocument()

    userEvent.click(upgradeBtn)
    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).toHaveBeenCalledWith(url, '_blank')
  })

  it('should show connectivity error when present', () => {
    // Mock the hook with connectivity error
    const mockWithError = {
      ...defaultMockHook,
      connectivityError: 'Connection error',
    }
    ;(useDatabaseOverview as jest.Mock).mockReturnValue(mockWithError)

    render(<DatabaseOverview />)

    // Check that the warning icon is displayed
    expect(screen.getByTestId('connectivityError')).toBeInTheDocument()
  })

  it('should call handleRefresh when auto-refresh is triggered', () => {
    const mockHandleRefresh = jest.fn()
    ;(useDatabaseOverview as jest.Mock).mockReturnValue({
      ...defaultMockHook,
      handleRefresh: mockHandleRefresh,
    })

    render(<DatabaseOverview />)

    // Find and click the refresh button
    const refreshButton = screen.getByTestId(
      'auto-refresh-overview-refresh-button',
    )
    userEvent.click(refreshButton)

    expect(mockHandleRefresh).toHaveBeenCalled()
  })
})
