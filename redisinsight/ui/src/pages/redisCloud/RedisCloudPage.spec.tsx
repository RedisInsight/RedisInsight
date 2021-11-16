import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RedisCloudPage, { Props } from './RedisCloudPage'

const mockedProps = mock<Props>()

const mockedRoutes = [
  {
    path: '/redis-enterprise-autodiscovery',
  },
]

describe('RedisCloudPage', () => {
  it('should render', () => {
    expect(
      render(<RedisCloudPage {...instance(mockedProps)} />, {
        withRouter: true,
      })
    ).toBeTruthy()

    expect(
      render(<RedisCloudPage routes={mockedRoutes} />, { withRouter: true })
    ).toBeTruthy()
  })
})
