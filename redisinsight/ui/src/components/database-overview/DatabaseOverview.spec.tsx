import React from 'react'
import { cloneDeep, set } from 'lodash'
import { initialStateDefault, mockStore, render } from 'uiSrc/utils/test-utils'
import { DatabaseConfigInfo } from 'uiSrc/slices/interfaces'
import DatabaseOverview from './DatabaseOverview'

const overviewData: DatabaseConfigInfo & { usedMemoryPercent: number | null } = {
  version: '6.0.0',
  usedMemory: 45.2 * 1024 * 1024, // 45.2 MB
  usedMemoryPercent: null,
  totalKeys: 5000,
  connectedClients: 1,
  cpuUsagePercentage: 0.23,
  networkInKbps: 3,
  networkOutKbps: 5,
  opsPerSecond: 10,
  cloudDetails: undefined
}
const initialState = set(initialStateDefault, 'connections.instances.instanceOverview', overviewData)

describe('DatabaseOverview', () => {
  let mockedStore: ReturnType<typeof mockStore>

  beforeEach(() => {
    jest.clearAllMocks()
    mockedStore = mockStore(initialState)
  })

  it('should render with metrics', () => {
    const { container, queryByRole } = render(<DatabaseOverview />, { store: mockedStore })

    expect(container.querySelector('[data-test-subj="overview-cpu"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-commands-sec"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-total-memory"]')).toHaveTextContent('45 MB')
    expect(container.querySelector('[data-test-subj="overview-total-keys"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test-subj="overview-connected-clients"]')).toBeInTheDocument()
    expect(queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument()
  })

  it('should render auto-refresh component', () => {
    const { container } = render(<DatabaseOverview />, { store: mockedStore })

    expect(container.querySelector('[data-testid="auto-refresh-overview-auto-refresh-container"]')).toBeInTheDocument()
  })

  it('should show upgrade button and memory usage percentage if cloud plan limit is present', () => {
    const state = set(cloneDeep(initialState), 'connections.instances.instanceOverview', {
      ...overviewData,
      cloudDetails: {
        cloudId: 123,
        subscriptionId: 123,
        subscriptionType: 'fixed',
        planMemoryLimit: 75,
        memoryLimitMeasurementUnit: 'MB',
      }
    })
    mockedStore = mockStore(state)

    const { container, queryByRole } = render(<DatabaseOverview />, { store: mockedStore })

    expect(container.querySelector('[data-test-subj="overview-total-memory"]')).toHaveTextContent('45 MB / 75 MB (60.3%)')
    expect(queryByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
  })

  it('should show not show upgrade button for flexible subscriptions', () => {
    const state = set(cloneDeep(initialState), 'connections.instances.instanceOverview', {
      ...overviewData,
      cloudDetails: {
        cloudId: 123,
        subscriptionId: 123,
        subscriptionType: 'flexible',
        planMemoryLimit: 75,
        memoryLimitMeasurementUnit: 'MB',
      }
    })
    mockedStore = mockStore(state)

    const { container, queryByRole } = render(<DatabaseOverview />, { store: mockedStore })

    expect(container.querySelector('[data-test-subj="overview-total-memory"]')).toHaveTextContent('45 MB / 75 MB (60.3%)')
    expect(queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument()
  })
})
