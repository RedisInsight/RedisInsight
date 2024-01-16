import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import { changeSelectedTab, toggleInsightsPanel } from 'uiSrc/slices/panels/insights'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import NoKeysFound, { Props } from './NoKeysFound'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'RE_CLOUD'
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NoKeysFound', () => {
  it('should render', () => {
    expect(render(<NoKeysFound {...mockedProps} />)).toBeTruthy()
  })

  it('should call props on click buttons', () => {
    const onAddMock = jest.fn()

    render(<NoKeysFound {...mockedProps} onAddKeyPanel={onAddMock} />)

    fireEvent.click(screen.getByTestId('add-key-msg-btn'))

    expect(onAddMock).toBeCalled()
  })

  it('should call proper events on click insights', () => {
    render(<NoKeysFound {...mockedProps} onAddKeyPanel={jest.fn()} />)

    fireEvent.click(screen.getByTestId('explore-msg-btn'))

    expect(store.getActions()).toEqual([
      changeSelectedTab(InsightsPanelTabs.Explore),
      toggleInsightsPanel(true)
    ])
  })

  it('should call proper events on click insights', () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<NoKeysFound {...mockedProps} onAddKeyPanel={jest.fn()} />)

    fireEvent.click(screen.getByTestId('explore-msg-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'RE_CLOUD',
        source: 'browser',
      }
    })
    sendEventTelemetry.mockRestore()
  })
})
