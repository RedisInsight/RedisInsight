import { within } from '@testing-library/react'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import HomeHeader, { Props } from './HomeHeader'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/content/create-redis-buttons', () => {
  const defaultState = jest.requireActual('uiSrc/slices/content/create-redis-buttons').initialState
  return {
    contentSelector: () => jest.fn().mockReturnValue({
      ...defaultState,
      loading: false,
      data: { cloud: { title: 'Limited offer', description: 'Try Redis Cloud' } }
    }),
  }
})

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES
  })
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('HomeHeader', () => {
  it('should render', () => {
    expect(render(<HomeHeader {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render capability promotion component', () => {
    render(<HomeHeader {...instance(mockedProps)} />)
    expect(screen.getByTestId('capability-promotion')).toBeInTheDocument()
  })

  it('should open import dbs dialog', () => {
    render(<HomeHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('import-from-file-btn'))

    expect(screen.getByTestId('import-dbs-dialog')).toBeInTheDocument()
  })

  it('should call proper telemetry on open and close import databases dialog', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<HomeHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('import-from-file-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CLICKED
    });

    (sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(within(screen.getByTestId('import-dbs-dialog')).getByTestId('cancel-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CANCELLED
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
