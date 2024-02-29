import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import PipelineStatisticsPage from './PipelineStatisticsPage'

describe('PipelineStatisticsPage', () => {
  it('should render', () => {
    expect(render(<PipelineStatisticsPage />)).toBeTruthy()
  })
})
