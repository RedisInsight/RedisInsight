import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { getDBAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'

import {
  cleanup,
  mockedStore,
  fireEvent,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import Header, { Props } from './Header'

const mockedProps = mock<Props>()

const mockReports = [
  { id: 'id_1', createdAt: '2022-09-23T05:30:23.000Z' },
  { id: 'id_2', createdAt: '2022-09-23T05:15:19.000Z' }
]

const mockProgress = {
  total: 10,
  scanned: 10,
  processed: 10
}

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('DatabaseAnalysisHeader', () => {
  it('should render', () => {
    expect(render(<Header {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not render progress', () => {
    const { queryByTestId } = render(<Header {...instance(mockedProps)} items={mockReports} progress={undefined} />)

    expect(queryByTestId('analysis-progress')).not.toBeInTheDocument()
  })

  it('should render progress', () => {
    render(<Header {...instance(mockedProps)} items={mockReports} progress={mockProgress} />)

    expect(screen.getByTestId('analysis-progress')).toBeInTheDocument()
  })
  it('should call "getDBAnalysis" action be called after click "start-database-analysis-btn"', () => {
    render(<Header {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('start-database-analysis-btn'))

    const expectedActions = [getDBAnalysis()]
    expect(store.getActions()).toEqual(expectedActions)
  })
  it('should send telemetry event after click "new analysis" btn', async () => {
    const sendEventTelemetryMock = jest.fn()

    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<Header {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('start-database-analysis-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.MEMORY_ANALYSIS_STARTED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
      }
    })

    sendEventTelemetry.mockRestore()
  })

  it.skip('should call onChangeSelectedAnalysis after change selector', async () => {
    const onChangeSelectedAnalysis = jest.fn()

    const { queryByText } = render(
      <Header
        {...instance(mockedProps)}
        onChangeSelectedAnalysis={onChangeSelectedAnalysis}
        items={mockReports}
        progress={mockProgress}
      />
    )

    fireEvent.click(screen.getByTestId('select-report'))
    fireEvent.click(queryByText('23 Sep 2022 05:30') || document)

    expect(onChangeSelectedAnalysis).toBeCalled()
  })
})
