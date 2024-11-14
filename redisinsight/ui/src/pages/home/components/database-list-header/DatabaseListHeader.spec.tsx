import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import DatabaseListHeader, { Props } from './DatabaseListHeader'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    enhancedCloudUI: {
      flag: false
    }
  }),
}))

jest.mock('uiSrc/slices/content/create-redis-buttons', () => ({
  ...jest.requireActual('uiSrc/slices/content/create-redis-buttons'),
  contentSelector: jest.fn().mockReturnValue({
    data: {
      cloud: {
        title: 'Try Redis Cloud: your ultimate Redis starting point',
        description: 'Includes native support for JSON, Search and Query, and more',
        links: {
          main: {
            altText: 'Try Redis Cloud.',
            url: 'https://redis.io/try-free/?utm_source=redisinsight&utm_medium=main&utm_campaign=main'
          }
        },
      }
    }
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('DatabaseListHeader', () => {
  it('should render', () => {
    expect(render(<DatabaseListHeader {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not show promo cloud button with disabled feature flag', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      enhancedCloudUI: {
        flag: true
      }
    })

    render(<DatabaseListHeader {...instance(mockedProps)} />)

    expect(screen.queryByTestId('promo-btn')).not.toBeInTheDocument()
  })

  it('should show promo cloud button with enabled feature flag', () => {
    (appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValueOnce({
      enhancedCloudUI: {
        flag: false
      }
    })

    render(<DatabaseListHeader {...instance(mockedProps)} />)

    expect(screen.getByTestId('promo-btn')).toBeInTheDocument()
  })
})
