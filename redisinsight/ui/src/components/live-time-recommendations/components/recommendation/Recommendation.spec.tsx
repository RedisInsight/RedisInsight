import React from 'react'
import { mock, instance } from 'ts-mockito'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { fireEvent, screen, render, mockedStore, cleanup, act } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'

import { updateRecommendation } from 'uiSrc/slices/recommendations/recommendations'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { openNewWindowDatabase } from 'uiSrc/utils'
import Recommendation, { IProps } from './Recommendation'

const recommendationsContent = MOCK_RECOMMENDATIONS
const mockedProps = mock<IProps>()

const instanceMock = {
  ...instance(mockedProps),
  recommendationsContent,
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  openNewWindowDatabase: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const PROVIDER = 'RE_CLOUD'

describe('Recommendation', () => {
  it('should render', () => {
    expect(render(<Recommendation
      {...instanceMock}
    />)).toBeTruthy()
  })

  it('should render content if recommendation is not read', () => {
    render(<Recommendation
      {...instanceMock}
      name="searchJSON"
      tutorial=""
      isRead={false}
    />)

    expect(screen.getByTestId('recommendation-voting')).toBeInTheDocument()
    expect(screen.getByTestId('searchJSON-to-tutorial-btn')).toBeInTheDocument()
  })

  it('should render RecommendationVoting', () => {
    const { container } = render(<Recommendation {...instanceMock} name="searchJSON" />)
    fireEvent.click(container.querySelector('[data-test-subj="searchJSON-button"]') as HTMLButtonElement)
    expect(screen.getByTestId('recommendation-voting')).toBeInTheDocument()
  })

  it('should properly push history on workbench page', () => {
    // will be improved
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    const { container } = render(
      <Recommendation
        {...instanceMock}
        isRead={false}
        name="searchJSON"
        tutorial=""
        provider={PROVIDER}
      />
    )

    fireEvent.click(container.querySelector('[data-test-subj="searchJSON-button"]') as HTMLButtonElement)
    fireEvent.click(screen.getByTestId('searchJSON-to-tutorial-btn'))

    expect(pushMock).toHaveBeenCalledWith(Pages.workbench(INSTANCE_ID_MOCK))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: 'searchJSON',
        provider: PROVIDER
      }
    })
    sendEventTelemetry.mockRestore()
  })

  it('should properly call openNewWindowDatabase and open a new window on workbench page to specific guide', () => {
    // will be improved
    const openNewWindowDatabaseMock = jest.fn();
    (openNewWindowDatabase as jest.Mock).mockImplementation(() => openNewWindowDatabaseMock)

    const { container } = render(
      <Recommendation
        {...instanceMock}
        isRead={false}
        name="searchJSON"
        tutorial="quick-guides/working-with-hash.html"
        provider={PROVIDER}
      />
    )

    fireEvent.click(container.querySelector('[data-test-subj="searchJSON-button"]') as HTMLButtonElement)
    fireEvent.click(screen.getByTestId('searchJSON-to-tutorial-btn'))

    expect(openNewWindowDatabase)
      .toHaveBeenCalledWith(`${Pages.workbench(INSTANCE_ID_MOCK)}?guidePath=quick-guides/working-with-hash.html`)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: 'searchJSON',
        provider: PROVIDER
      }
    })
    sendEventTelemetry.mockRestore()
    openNewWindowDatabase.mockRestore()
  })

  it('should properly push history on workbench page to specific tutorial', () => {
    // will be improved
    const openNewWindowDatabaseMock = jest.fn();
    (openNewWindowDatabase as jest.Mock).mockImplementation(() => openNewWindowDatabaseMock)

    const { container } = render(
      <Recommendation
        {...instanceMock}
        isRead={false}
        name="searchJSON"
        tutorial="/redis_stack/working_with_json.md"
        provider={PROVIDER}
      />
    )

    fireEvent.click(container.querySelector('[data-test-subj="searchJSON-button"]') as HTMLButtonElement)
    fireEvent.click(screen.getByTestId('searchJSON-to-tutorial-btn'))

    expect(openNewWindowDatabase)
      .toHaveBeenCalledWith(`${Pages.workbench(INSTANCE_ID_MOCK)}?guidePath=/redis_stack/working_with_json.md`)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_RECOMMENDATION_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        name: 'searchJSON',
        provider: PROVIDER
      }
    })
    sendEventTelemetry.mockRestore()
    openNewWindowDatabase.mockRestore()
  })

  it('should render hide/unhide button', () => {
    const name = 'searchJSON'
    render(<Recommendation {...instanceMock} name={name} />)

    expect(screen.getByTestId('toggle-hide-searchJSON-btn')).toBeInTheDocument()
  })

  it('click on hide/unhide button should call updateLiveRecommendation', async () => {
    const idMock = 'id'
    const nameMock = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation
        {...instanceMock}
        id={idMock}
        name={nameMock}
      />
    )

    await act(() => {
      fireEvent.click(queryByTestId('toggle-hide-searchJSON-btn') as HTMLButtonElement)
    })

    const expectedActions = [updateRecommendation()]

    expect(store.getActions()).toEqual(expectedActions)
    expect(screen.getByTestId('toggle-hide-searchJSON-btn')).toBeInTheDocument()
  })

  it('should not render "Tutorial" btn if tutorial is Undefined', () => {
    const name = 'searchJSON'
    const { queryByTestId } = render(<Recommendation {...instanceMock} name={name} tutorial={undefined} />)

    expect(queryByTestId(`${name}-to-tutorial-btn`)).not.toBeInTheDocument()
  })

  it('should render "Tutorial" if tutorial="path"', () => {
    const name = 'searchJSON'
    const { queryByTestId } = render(<Recommendation {...instanceMock} name={name} tutorial="path" />)

    expect(queryByTestId(`${name}-to-tutorial-btn`)).toHaveTextContent('Tutorial')
  })

  it('should render "Workbench" btn if tutorial=""', () => {
    const name = 'searchJSON'
    const { queryByTestId } = render(<Recommendation {...instanceMock} name={name} tutorial="" />)

    expect(queryByTestId(`${name}-to-tutorial-btn`)).toHaveTextContent('Workbench')
  })

  it('should render Snooze button', () => {
    const name = 'searchJSON'
    render(<Recommendation {...instanceMock} name={name} />)

    expect(screen.getByTestId(`${name}-delete-btn`)).toBeInTheDocument()
  })

  it('click on Snooze button should call deleteLiveRecommendations', async () => {
    const idMock = 'id'
    const nameMock = 'searchJSON'
    const { queryByTestId } = render(
      <Recommendation
        {...instanceMock}
        id={idMock}
        name={nameMock}
      />
    )

    fireEvent.click(queryByTestId(`${nameMock}-delete-btn`) as HTMLButtonElement)

    const expectedActions = [
      updateRecommendation(),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })
})
