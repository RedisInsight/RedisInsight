import React from 'react'
import { mock, instance } from 'ts-mockito'
import reactRouterDom from 'react-router-dom'
import { fireEvent, screen, render } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'

import Recommendation, { IProps } from './Recommendation'

const mockedProps = mock<IProps>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('Recommendation', () => {
  it('should render', () => {
    expect(render(<Recommendation {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should properly push history on workbench page', () => {
    // will be improved
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<Recommendation name="name" instanceId="id" />)

    fireEvent.click(screen.getByTestId('name-to-tutorial-btn'))
    expect(pushMock).toHaveBeenCalledWith(Pages.workbench('id'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: 'id',
        name: 'name',
      }
    })
    sendEventTelemetry.mockRestore()
  })
})
