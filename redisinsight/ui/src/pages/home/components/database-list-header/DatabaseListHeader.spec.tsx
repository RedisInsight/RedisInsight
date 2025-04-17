import React from 'react'
import { instance, mock } from 'ts-mockito'

import { cleanup, fireEvent, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import { DatabaseListColumn } from 'uiSrc/constants'

import DatabaseListHeader, { Props } from './DatabaseListHeader'

const mockInstances: Instance[] = [
  {
    id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
    host: 'localhost',
    port: 6379,
    name: 'localhost',
    username: null,
    password: null,
    connectionType: ConnectionType.Standalone,
    nameFromProvider: null,
    new: true,
    modules: [],
    version: null,
    lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    provider: 'provider'
  }
]

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    enhancedCloudUI: {
      flag: false,
    },
    databaseManagement: {
      flag: true,
    },
    cloudAds: {
      flag: true,
    },
  }),
}))

const mockShownColumns: DatabaseListColumn[] = [
  DatabaseListColumn.Name,
  DatabaseListColumn.Controls,
]

const mockHiddenColumns: DatabaseListColumn[] = [
  DatabaseListColumn.Host,
  DatabaseListColumn.ConnectionType,
  DatabaseListColumn.LastConnection,
  DatabaseListColumn.Modules,
]

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    shownColumns: ['name', 'controls'],
    data: [...mockInstances],
  }),
}))

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons'),
  contentSelector: jest.fn().mockReturnValue({
    data: {
      cloud: {
        title: 'Try Redis Cloud: your ultimate Redis starting point',
        description:
          'Includes native support for JSON, Search and Query, and more',
        links: {
          main: {
            altText: 'Try Redis Cloud.',
            url: 'https://redis.io/try-free/?utm_source=redisinsight&utm_medium=main&utm_campaign=main',
          },
        },
      },
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('DatabaseListHeader', () => {
  it('should render', () => {
    expect(
      render(<DatabaseListHeader {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should not show promo cloud button with disabled feature flag', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      enhancedCloudUI: {
        flag: true,
      },
    })

    render(<DatabaseListHeader {...instance(mockedProps)} />)

    expect(screen.queryByTestId('promo-btn')).not.toBeInTheDocument()
  })

  it('should show promo cloud button with enabled feature flag', () => {
    render(<DatabaseListHeader {...instance(mockedProps)} />)

    expect(screen.getByTestId('promo-btn')).toBeInTheDocument()
  })

  it('should show "create database" button when database management feature flag is enabled', () => {
    const { queryByTestId } = render(
      <DatabaseListHeader {...instance(mockedProps)} />,
    )

    expect(queryByTestId('add-redis-database-short')).toBeInTheDocument()
  })

  it('should hide "create database" button when database management feature flag is disabled', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      databaseManagement: {
        flag: false,
      },
    })

    const { queryByTestId } = render(
      <DatabaseListHeader {...instance(mockedProps)} />,
    )

    expect(queryByTestId('add-redis-database-short')).not.toBeInTheDocument()
  })

  it('should show checkbox when columns config button is clicked', async () => {
    render(<DatabaseListHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('btn-columns-config'))

    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()

    mockShownColumns.forEach(column => {
      const checkbox = screen.getByTestId(`show-${column}`)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toBeChecked()
    })

    mockHiddenColumns.forEach(column => {
      const checkbox = screen.getByTestId(`show-${column}`)
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })
  })
})
