import set from 'lodash/set'
import { waitFor } from '@testing-library/react'
import { startActivityMonitor, stopActivityMonitor } from 'uiSrc/components/main-router/activityMonitor'
import { getConfig } from 'uiSrc/config'

const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
const addEventListenerProps = { passive: true, capture: true }
const removeEventListenerProps = { capture: true }

const riConfig = getConfig()

const mockConfig = (origin = 'http://localhost', throttleTimeout = 200) => {
  set(riConfig, 'app.activityMonitorOrigin', origin)
  set(riConfig, 'app.activityMonitorThrottleTimeout', throttleTimeout)
}

const mockWindowOpener = (postMessage = jest.fn()) => {
  global.window.opener = {
    postMessage
  }
}

beforeEach(() => {
  jest.resetAllMocks()
  mockConfig()
  mockWindowOpener()
})

describe('Activity monitor', () => {
  it('should start and stop activity monitor if window.opener and monitor origin are defined', () => {
    startActivityMonitor()
    expect(addEventListenerSpy).toHaveBeenCalledTimes(4)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(1, 'click', expect.any(Function), addEventListenerProps)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(2, 'keydown', expect.any(Function), addEventListenerProps)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(3, 'scroll', expect.any(Function), addEventListenerProps)
    expect(addEventListenerSpy).toHaveBeenNthCalledWith(4, 'touchstart', expect.any(Function), addEventListenerProps)

    stopActivityMonitor()
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(4)
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(1, 'click', expect.any(Function), removeEventListenerProps)
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(2, 'keydown', expect.any(Function), removeEventListenerProps)
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(3, 'scroll', expect.any(Function), removeEventListenerProps)
    expect(removeEventListenerSpy).toHaveBeenNthCalledWith(4, 'touchstart', expect.any(Function), removeEventListenerProps)
  })

  it('should not start or stop activity monitor if window.opener is undefined', () => {
    global.window.opener = undefined

    startActivityMonitor()
    stopActivityMonitor()

    expect(addEventListenerSpy).not.toHaveBeenCalled()
    expect(removeEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should not start or stop activity monitor if monitor origin is falsey', () => {
    mockConfig('')

    startActivityMonitor()
    stopActivityMonitor()

    expect(addEventListenerSpy).not.toHaveBeenCalled()
    expect(removeEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should throttle events and call window.opener.postMessage', async () => {
    const mockPostMessage = jest.fn()

    mockWindowOpener(mockPostMessage)
    startActivityMonitor()

    expect(addEventListenerSpy).toHaveBeenCalledTimes(4)

    // simulate events
    const activityHandler = addEventListenerSpy.mock.calls[0]?.[1] as Function
    activityHandler()
    activityHandler()
    activityHandler()
    activityHandler()

    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledTimes(1)
    })
  })

  it('should ignore errors from activity handler function', async () => {
    const mockPostMessage = jest.fn(() => {
      throw new Error('test')
    })

    mockWindowOpener(mockPostMessage)
    startActivityMonitor()

    expect(addEventListenerSpy).toHaveBeenCalledTimes(4)

    // simulate events
    const activityHandler = addEventListenerSpy.mock.calls[0]?.[1] as Function
    expect(() => activityHandler()).not.toThrow()
  })

  it('should ignore errors from window.addEventListener', () => {
    jest.spyOn(window, 'addEventListener').mockImplementation(jest.fn(() => {
      throw new Error('Test')
    }))

    mockWindowOpener()

    expect(startActivityMonitor).not.toThrow()
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1)
  })
})
