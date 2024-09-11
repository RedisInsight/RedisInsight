import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { cleanup, fireEvent, mockedStore, render, screen, waitForEuiPopoverVisible } from 'uiSrc/utils/test-utils'

import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ChatHeader, { Props } from './ChatHeader'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ChatHeader', () => {
  it('should render', () => {
    expect(render(<ChatHeader {...mockedProps} databaseId="1" />)).toBeTruthy()
  })

  it('should render disabled restart session button', () => {
    render(<ChatHeader {...mockedProps} databaseId="1" isClearDisabled />)

    expect(screen.getByTestId('ai-restart-session-btn')).toBeDisabled()
  })

  it('should not render instanceName if databaseId is null', () => {
    const instanceName = 'redisInstanceName'
    render(<ChatHeader {...mockedProps} databaseId={null} connectedInstanceName={instanceName} />)
    expect(screen.queryByText(instanceName)).toBe(null)
  })

  it('should call proper actions after click on tutorial button', async () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)

    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    render(<ChatHeader {...mockedProps} databaseId="1" />)

    fireEvent.click(screen.getByTestId('ai-tutorial-btn'))

    await waitForEuiPopoverVisible()

    fireEvent.click(screen.getByTestId('ai-open-tutorials'))

    expect(store.getActions()).toEqual([
      resetExplorePanelSearch(),
      setExplorePanelIsPageOpen(false),
      changeSelectedTab(InsightsPanelTabs.Explore),
      changeSidePanel(SidePanels.Insights),
    ])

    expect(pushMock).toHaveBeenCalledWith({ search: '' })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        databaseId: '1',
        source: 'chatbot_tutorials_button',
      }
    })
  })
})
