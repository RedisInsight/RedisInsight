import React from 'react'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import MoreInfoPopover from './MoreInfoPopover'

describe('MoreInfoPopover', () => {
  it('should render', () => {
    expect(render(<MoreInfoPopover metrics={[]} modules={[]} />)).toBeTruthy()
  })

  it('should render modules and metrics', () => {
    const metricsMock = [{
      id: '1',
      content: <></>,
      value: 'value',
      unavailableText: 'text',
      title: 'title',
      tooltip: {
        icon: null,
        content: 'content'
      }
    }]
    const modulesMock = [{ name: 'search' }]
    const { queryByTestId } = render(<MoreInfoPopover metrics={metricsMock} modules={modulesMock} />)

    fireEvent.click(queryByTestId('overview-more-info-button'))
    fireEvent.click(queryByTestId('free-database-link'))

    expect(queryByTestId('overview-more-info-tooltip')).toBeInTheDocument()
  })
})
