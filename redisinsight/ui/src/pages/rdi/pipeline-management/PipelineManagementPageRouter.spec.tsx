import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import PipelinePageRouter from './PipelineManagementPageRouter'

const mockedRoutes = [
  {
    path: '/page',
  },
]

describe('PipelinePageRouter', () => {
  it('should render', () => {
    expect(
      render(<PipelinePageRouter routes={mockedRoutes} />, { withRouter: true })
    ).toBeTruthy()
  })
})
