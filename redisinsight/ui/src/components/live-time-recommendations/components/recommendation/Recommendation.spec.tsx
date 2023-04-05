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

  it('should render content if recommendation is not read', () => {
    render(<Recommendation {...instance(mockedProps)} name="searchJSON" isRead={false} />)

    expect(screen.getByTestId('recommendation-voting')).toBeInTheDocument()
    expect(screen.getByTestId('searchJSON-to-tutorial-btn')).toBeInTheDocument()
  })

  it('should render RecommendationVoting', () => {
    const { container } = render(<Recommendation {...instance(mockedProps)} name="searchJSON" />)
    fireEvent.click(container.querySelector('[data-test-subj="searchJSON-button"]') as HTMLButtonElement)
    expect(screen.getByTestId('recommendation-voting')).toBeInTheDocument()
  })

  it('should properly push history on workbench page', () => {
    // will be improved
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    const { container } = render(<Recommendation {...instance(mockedProps)} isRead={false} name="searchJSON" instanceId="id" />)

    fireEvent.click(container.querySelector('[data-test-subj="searchJSON-button"]') as HTMLButtonElement)
    fireEvent.click(screen.getByTestId('searchJSON-to-tutorial-btn'))

    expect(pushMock).toHaveBeenCalledWith(Pages.workbench('id'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATIONS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: 'id',
        name: 'searchJSON',
      }
    })
    sendEventTelemetry.mockRestore()
  })
})
