import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import RdiStatisticsHeader from './RdiStatisticsHeader'

const mockedProps = {
  loading: false
}

describe('RdiStatisticsHeader', () => {
  it('should render', () => {
    expect(render(<RdiStatisticsHeader {...mockedProps} />)).toBeTruthy()
  })

  it('should render Insights button with loading state', () => {
    const { getByTestId } = render(<RdiStatisticsHeader loading />)
    expect(getByTestId('rdi-insights-btn')).toBeTruthy()
  })

  it('should render Insights button with disabled state', () => {
    const { getByTestId } = render(<RdiStatisticsHeader loading />)
    expect(getByTestId('rdi-insights-btn')).toBeDisabled()
  })
})
