import loadSegmentAnalytics from '../loadSegmentAnalytics'

beforeEach(() => {
  window.analytics = {}
  window.console = { error: jest.fn() }
})

describe('loadSegmentAnalytics', () => {
  const writeKeyMock = '123123'

  it('"window.analytics" should be invoked', () => {
    loadSegmentAnalytics(writeKeyMock)

    expect(window.analytics.invoked).toBeTruthy()
  })
  it('second call "loadSegmentAnalytics" should return console.error', () => {
    loadSegmentAnalytics(writeKeyMock)
    loadSegmentAnalytics(writeKeyMock)

    expect(window.analytics.invoked).toBeTruthy()
    expect(console.error).toBeCalled()
  })
})
