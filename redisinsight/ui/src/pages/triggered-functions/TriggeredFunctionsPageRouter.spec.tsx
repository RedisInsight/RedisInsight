import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import TriggeredFunctionsPageRouter from './TriggeredFunctionsPageRouter'

const mockedRoutes = [
  {
    path: '/page',
  },
]

describe('TriggeredFunctionsPageRouter', () => {
  it('should render', () => {
    expect(
      render(<TriggeredFunctionsPageRouter routes={mockedRoutes} />, { withRouter: true })
    ).toBeTruthy()
  })
})
