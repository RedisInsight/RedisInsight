import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import RedisClusterDatabasesPage from './RedisClusterDatabasesPage'

/**
 * RedisClusterDatabasesPage tests
 *
 * @group component
 */
describe('RedisClusterDatabasesPage', () => {
  it('should render', () => {
    expect(render(<RedisClusterDatabasesPage />)).toBeTruthy()
  })
})
