import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'

import styles from './styles.module.scss'

export interface ChartData {
  total: number,
  threshold: 0
  name: string
  label: string
  meta?: {
    [key: string]: any
  }
}

interface IProps {
  data: ChartData[]
  width: number
  height: number
  multiplierGrid?: number
  tooltipValidation: (val: any, index: number) => any
  leftAxiosValidation: (val: any, index: number) => any
  bottomAxiosValidation: (val: any, index: number) => any
}

export const DEFAULT_MULTIPLIER_GRID = 2
let cleanedData = []

const AreaChart = (props: IProps) => {
  const {
    data,
    width: initWidth,
    height: initHeight,
    multiplierGrid = DEFAULT_MULTIPLIER_GRID,
    tooltipValidation = (val, index) => val,
    leftAxiosValidation = (val, index) => val,
    bottomAxiosValidation = (val, index) => val,
  } = props

  const margin = { top: 10, right: 30, bottom: 30, left: 60 }
  const width = initWidth - margin.left - margin.right
  const height = initHeight - margin.top - margin.bottom

  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (data.length === 0) {
      return
    }

    const tooltip = d3.select('body').append('div')
      .attr('class', styles.tooltip)
      .style('opacity', 0)

    d3
      .select(svgRef.current)
      .select('g')
      .remove()

    // append the svg object to the body of the page
    const svg = d3.select(svgRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform',
        `translate(${margin.left},${margin.top})`)

    const area = d3.area()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.total))
      .curve(d3.curveMonotoneX)

    cleanedData = data.map((datum, index) => ({
      index,
      date: index,
      label: `${datum?.label}`,
      total: datum.total,
      threshold: datum.threshold
    }))

    const x = d3.scaleLinear()
      .domain(d3.extent(cleanedData, (d) => d.index))
      .range([0, width])

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(cleanedData, (d) => +d.total)])
      .range([height, 0])

    svg.append('path')
      .datum(cleanedData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--euiColorPrimary)')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x((d) => x(d.date))
        .y((d) => y(d.total))
        .curve(d3.curveMonotoneX))

    svg.append('path')
      .datum(cleanedData)
      .attr('class', styles.area)
      .attr('d', area)

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(cleanedData.length * multiplierGrid)
          .tickFormat((d, i) => bottomAxiosValidation(d, i))
          .tickSize(-height)
          .tickPadding(20)
      )

    svg.append('g')
      .call(
        d3.axisLeft(y)
          .ticks(cleanedData.length * multiplierGrid)
          .tickFormat((d, i) => leftAxiosValidation(d, i))
          .tickSize(-width)
          .tickPadding(10)
      )

    svg.selectAll('circle')
      .data(cleanedData)
      .enter()
      .append('circle')
      .attr('class', styles.scatterPoints)
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.total))
      .attr('r', 5)
      .raise()
      .on('mouseover', (event, d) => {
        tooltip?.transition()
          .duration(200)
          .style('opacity', 1)
        tooltip?.html(tooltipValidation(d.total, d.index))
          .style('left', `${event.pageX - 40}px`)
          .style('top', `${event.pageY - 70}px`)
      })
      .on('mouseout', (d) => {
        tooltip?.transition()
          .duration(500)
          .style('opacity', 0)
      })

    // x axios Label
    // svg.append('text')
    //   .attr('class', styles.label)
    //   .attr('transform',
    //     `translate(${width / 2} ,${
    //       height + margin.top + 30})`)
    //   .style('text-anchor', 'middle')
    //   .text('Date')

    // y axios Label
    // svg.append('text')
    //   .attr('class', styles.label)
    //   .attr('transform', 'rotate(-90)')
    //   .attr('y', 0 - margin.left)
    //   .attr('x', 0 - (height / 2))
    //   .attr('dy', '1em')
    //   .style('text-anchor', 'middle')
    //   .text('Events')

    return () => {
      tooltip?.remove()
    }
  }, [data, width, height])

  return (
    <div className={styles.wrapper} style={{ width: initWidth, height: initHeight }}>
      <svg ref={svgRef} className={styles.svg} />
    </div>
  )
}

export default AreaChart
