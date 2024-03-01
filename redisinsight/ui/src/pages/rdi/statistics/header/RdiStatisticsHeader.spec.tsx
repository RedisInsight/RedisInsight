import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import RdiStatisticsHeader from './RdiStatisticsHeader'

describe('RdiStatisticsHeader', () => {
  it('should render', () => {
    expect(render(<RdiStatisticsHeader />)).toBeTruthy()
  })
})
