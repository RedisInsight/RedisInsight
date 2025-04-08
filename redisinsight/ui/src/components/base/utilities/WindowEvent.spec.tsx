import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { WindowEvent } from './WindowEvent'

describe('WindowEvent', () => {
  let windowAddCount = 0
  let windowRemoveCount = 0

  beforeAll(() => {
    // React 16 and 17 register a bunch of error listeners which we don't need to capture
    window.addEventListener = jest.fn((event: string) => {
      if (event !== 'error') {
        windowAddCount++
      }
    })
    window.removeEventListener = jest.fn((event: string) => {
      if (event !== 'error') {
        windowRemoveCount++
      }
    })
  })

  beforeEach(() => {
    // Reset counts
    windowAddCount = 0
    windowRemoveCount = 0
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('attaches handler to window event on mount', () => {
    const handler = () => null
    render(<WindowEvent event="click" handler={handler} />)
    expect(window.addEventListener).toHaveBeenCalledWith('click', handler)
    expect(windowAddCount).toEqual(1)
  })

  test('removes handler on unmount', () => {
    const handler = () => null
    const { unmount } = render(<WindowEvent event="click" handler={handler} />)
    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith('click', handler)
    expect(windowRemoveCount).toEqual(1)
  })

  test('removes and re-attaches handler to window event on update', () => {
    const handler1 = () => null
    const handler2 = () => null
    const { rerender } = render(
      <WindowEvent event="click" handler={handler1} />,
    )

    expect(window.addEventListener).toHaveBeenCalledWith('click', handler1)

    rerender(<WindowEvent event="keydown" handler={handler2} />)

    expect(window.removeEventListener).toHaveBeenCalledWith('click', handler1)
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', handler2)
  })

  test('does not remove or re-attach handler if update is irrelevant', () => {
    const handler = () => null
    const { rerender } = render(<WindowEvent event="click" handler={handler} />)
    expect(windowAddCount).toEqual(1)

    rerender(
      <WindowEvent event="click" handler={handler} data-test-subj="whatever" />,
    )
    expect(windowAddCount).toEqual(1)
    expect(windowRemoveCount).toEqual(0)
  })
})
