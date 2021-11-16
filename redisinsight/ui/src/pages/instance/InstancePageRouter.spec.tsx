import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import InstancePageRouter from './InstancePageRouter'

const mockedRoutes = [
  {
    path: '/redis-enterprise-autodiscovery',
  },
]

describe('InstancePageRouter', () => {
  it('should render', () => {
    expect(
      render(<InstancePageRouter routes={mockedRoutes} />, { withRouter: true })
    ).toBeTruthy()
  })
})
