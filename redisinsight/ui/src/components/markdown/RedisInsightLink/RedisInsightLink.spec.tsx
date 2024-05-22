import React from 'react'
import reactRouterDom from 'react-router-dom'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import RedisInsightLink from './RedisInsightLink'

jest.mock('uiSrc/utils/routing', () => ({
  ...jest.requireActual('uiSrc/utils/routing')
}))

Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost'
  },
  writable: true
})

describe('RedisInsightLink', () => {
  it('should render', () => {
    expect(render(<RedisInsightLink url="/" text="label" />)).toBeTruthy()
  })

  it('should call proper history push on click', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<RedisInsightLink url="/settings" text="label" />)

    fireEvent.click(screen.getByTestId('redisinsight-link'))

    expect(pushMock).toHaveBeenCalledWith('/settings')
  })
})
