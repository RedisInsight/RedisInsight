import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import RedisCloudSubscriptionsPage from './RedisCloudSubscriptionsPage'

describe('RedisCloudSubscriptionsPage', () => {
  it('should render', () => {
    expect(render(<RedisCloudSubscriptionsPage />)).toBeTruthy()
  })
})
