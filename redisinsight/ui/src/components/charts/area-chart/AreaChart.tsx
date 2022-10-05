import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'

import styles from './styles.module.scss'

export interface AreaChartData {
  y: number
  x: number
  xlabel: string
  ylabel: string
}

interface IDatum {
  index: number
  xlabel: string
  ylabel: string
  y: number
  x: number
}

interface IProps {
  name?: string
  data?: AreaChartData[]
  width?: number
  height?: number
  divideLastColumn?: boolean
  multiplierGrid?: number
  tooltipValidation?: (val: any, index: number) => any
  leftAxiosValidation?: (val: any, index: number) => any
  bottomAxiosValidation?: (val: any, index: number) => any
}

export const DEFAULT_MULTIPLIER_GRID = 2
let cleanedData: IDatum[] = []

const AreaChart = (props: IProps) => {
  const {
    data = [],
    name,
    width: propWidth = 0,
    height: propHeight = 0,
    divideLastColumn,
    multiplierGrid = DEFAULT_MULTIPLIER_GRID,
    tooltipValidation = (val) => val,
    leftAxiosValidation = (val) => val,
    bottomAxiosValidation = (val) => val,
  } = props

  const margin = { top: 10, right: 30, bottom: 32, left: 60 }
  const width = propWidth - margin.left - margin.right
  const height = propHeight - margin.top - margin.bottom

  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (data.length === 0) {
      return undefined
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
      .attr('data-testid', `area-${name}`)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 30)
      .append('g')
      .attr('transform',
        `translate(${margin.left},${margin.top})`)

    const area = d3.area<IDatum>()
      .x((d) => xAxis(d.index))
      .y0(height)
      .y1((d) => yAxis(d.y))
      .curve(d3.curveMonotoneX)

    cleanedData = data.map((datum, index) => ({
      index,
      xlabel: `${datum?.xlabel || ''}`,
      ylabel: `${datum?.ylabel || ''}`,
      y: datum.y,
      x: datum.x
    }))

    const xAxis = d3.scaleLinear()
      .domain(d3.extent(cleanedData, (d) => d.index) as [number, number])
      .range([0, width])

    // Add Y axis
    const yAxis = d3.scaleLinear()
      .domain([0, d3.max(cleanedData, (d) => +d.y) || 0])
      .range([height, 0])

    svg.append('path')
      .datum(cleanedData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--euiColorPrimary)')
      .attr('stroke-width', 2)
      .attr('d', d3.line<IDatum>()
        .x((d) => xAxis(d.index))
        .y((d) => yAxis(d.y))
        .curve(d3.curveMonotoneX))

    if (divideLastColumn) {
      svg.append('line')
        .attr('x1', xAxis(cleanedData.length - 1.5))
        .attr('x2', xAxis(cleanedData.length - 1.5))
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', 'var(--euiTextSubduedColor)')
        .style('stroke-width', '1px')
        .style('stroke-dasharray', '5,3')
    }

    svg.append('path')
      .datum(cleanedData)
      .attr('class', styles.area)
      .attr('d', area)

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(xAxis)
          .ticks(cleanedData.length * multiplierGrid)
          .tickFormat((d, i) => bottomAxiosValidation(d, i))
          .tickSize(-height)
          .tickPadding(22)
      )

    svg.append('g')
      .call(
        d3.axisLeft(yAxis)
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
      .attr('cx', (d) => xAxis(d.index))
      .attr('cy', (d) => yAxis(d.y))
      .attr('r', 5)
      .attr('data-testid', (d) => `circle-${d.x}-${d.y}`)
      .raise()
      .on('mousemove mouseenter', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 1)
        tooltip.html(`${tooltipValidation(d.y, d.index)}<div class=${styles.arrow}></div>`)
          .style('left', `${event.pageX - 40}px`)
          .style('top', `${event.pageY - 70}px`)
          .attr('data-testid', 'area-tooltip-circle')
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(100)
          .style('opacity', 0)
      })

    return () => {
      tooltip.remove()
    }
  }, [data, width, height])

  if (!data.length) {
    return null
  }

  return (
    <div className={styles.wrapper} style={{ width: propWidth, height: propHeight }}>
      <svg ref={svgRef} className={styles.svg} />
    </div>
  )
}

export default AreaChart
