import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import RedisClusterDatabasesPage from './RedisClusterDatabasesPage'

describe('RedisClusterDatabasesPage', () => {
  it('should render', () => {
    expect(render(<RedisClusterDatabasesPage />)).toBeTruthy()
  })
})
