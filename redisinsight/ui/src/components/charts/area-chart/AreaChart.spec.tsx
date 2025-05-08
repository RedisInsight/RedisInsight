import { last } from 'lodash'
import React from 'react'
import { render, screen, fireEvent, waitFor } from 'uiSrc/utils/test-utils'

import AreaChart, { AreaChartData, AreaChartDataType } from './AreaChart'

const mockData: AreaChartData[] = [
  { x: 1, y: 0, xlabel: '', ylabel: '' },
  { x: 5, y: 10, xlabel: '', ylabel: '' },
  { x: 10, y: 20, xlabel: '', ylabel: '' },
  { x: 2, y: 30, xlabel: '', ylabel: '' },
  { x: 30, y: 40, xlabel: '', ylabel: '' },
  { x: 15, y: 50000, xlabel: '', ylabel: '' },
]

describe('AreaChart', () => {
  it('should render with empty data', () => {
    expect(render(<AreaChart data={[]} />)).toBeTruthy()
  })

  it('should render with data', () => {
    expect(render(<AreaChart data={mockData} />)).toBeTruthy()
  })

  it('should not render area with empty data', () => {
    const { container } = render(<AreaChart data={[]} name="test" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render svg', () => {
    render(<AreaChart data={mockData} name="test" />)
    expect(screen.getByTestId('area-test')).toBeInTheDocument()
  })

  it('should render circles', () => {
    render(<AreaChart data={mockData} />)
    mockData.forEach(({ x, y }) => {
      expect(screen.getByTestId(`circle-${x}-${y}`)).toBeInTheDocument()
    })
  })

  it('should render tooltip and content inside', async () => {
    render(<AreaChart data={mockData} name="test" />)

    await waitFor(
      () => {
        fireEvent.mouseMove(screen.getByTestId('circle-15-50000'))
      },
      { timeout: 210 },
    ) // Account for long delay on tooltips

    expect(screen.getByTestId('area-tooltip-circle')).toBeInTheDocument()
    expect(screen.getByTestId('area-tooltip-circle')).toHaveTextContent('50000')
  })

  it('when dataType="Bytes" max value should be rounded by metric', async () => {
    const lastDataValue = last(mockData)
    const { queryByTestId } = render(
      <AreaChart
        data={mockData}
        name="test"
        dataType={AreaChartDataType.Bytes}
      />,
    )

    expect(queryByTestId(`ytick-${lastDataValue?.y}-4`)).not.toBeInTheDocument()
    expect(queryByTestId('ytick-51200-4')).toBeInTheDocument()
    expect(queryByTestId('ytick-51200-4')).toHaveTextContent('51200')
  })

  it('when dataType!="Bytes" max value should be rounded by default', async () => {
    const lastDataValue = last(mockData)
    const { queryByTestId } = render(<AreaChart data={mockData} name="test" />)

    expect(queryByTestId('ytick-51200-4')).not.toBeInTheDocument()
    expect(queryByTestId(`ytick-${lastDataValue?.y}-4`)).toBeInTheDocument()
    expect(queryByTestId(`ytick-${lastDataValue?.y}-4`)).toHaveTextContent(
      `${lastDataValue?.y}`,
    )
  })
})
