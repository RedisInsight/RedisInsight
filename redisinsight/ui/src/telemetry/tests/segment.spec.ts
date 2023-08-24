import { SegmentTelemetryService } from '../segment'

beforeEach(() => {
  window.analytics = {
    push: jest.fn(),
    page: jest.fn(),
    identify: jest.fn(),
    track: jest.fn(),
  }
  window.console = { error: jest.fn() }
})

describe('loadSegmentAnalytics', () => {
  const writeKeyMock = '123123'
  const pageNameMock = 'pageName'
  const installationIdMock = 'installationId'
  const sessionIdMock = 2

  it('"window.analytics" should be invoked', async () => {
    const segmentService = new SegmentTelemetryService(writeKeyMock)
    await segmentService.initialize()
    expect(window.analytics.invoked).toBeTruthy()
  })

  it('"window.analytics" should be truthy', async () => {
    const segmentService = new SegmentTelemetryService(writeKeyMock)
    segmentService.identify({
      sessionId: sessionIdMock,
      installationId: installationIdMock,
    })
    segmentService.pageView(pageNameMock, {})
    segmentService.event(pageNameMock, {})
    expect(window.analytics).toBeTruthy()
  })
})
