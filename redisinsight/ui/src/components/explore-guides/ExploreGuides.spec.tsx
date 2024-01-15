import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import { Pages } from 'uiSrc/constants'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'

import ExploreGuides from './ExploreGuides'

jest.mock('uiSrc/slices/content/guide-links', () => ({
  ...jest.requireActual('uiSrc/slices/content/guide-links'),
  guideLinksSelector: jest.fn().mockReturnValue({
    data: MOCK_EXPLORE_GUIDES
  })
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'RE_CLOUD'
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('ExploreGuides', () => {
  it('should render', () => {
    expect(render(<ExploreGuides />)).toBeTruthy()
  })

  it('should render guides', () => {
    render(<ExploreGuides />)

    MOCK_EXPLORE_GUIDES.forEach(({ title, icon }) => {
      expect(screen.getByTestId(`guide-button-${title}`)).toBeInTheDocument()
      expect(screen.getByTestId(`guide-icon-${icon}`)).toBeInTheDocument()
    })
  })

  it('should call proper history push after click on guide', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<ExploreGuides />)

    fireEvent.click(screen.getByTestId('guide-button-Search and Query'))

    expect(pushMock)
      .toHaveBeenCalledWith({
        search: 'guidePath=/quick-guides/document/introduction.md'
      })
  })

  it('should call proper history push after click on guide with tutorial', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<ExploreGuides />)

    fireEvent.click(screen.getByTestId('guide-button-JSON'))

    expect(pushMock).toHaveBeenCalledWith({
      search: 'guidePath=/quick-guides/document/working-with-json.md'
    })
  })

  it('should call proper telemetry event after click on guide', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    render(<ExploreGuides />)

    fireEvent.click(screen.getByTestId('guide-button-Search and Query'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BROWSER_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        guideName: 'Search and Query',
        provider: 'RE_CLOUD',
        viewType: KeyViewType.Browser,
      }
    })
  })
})
