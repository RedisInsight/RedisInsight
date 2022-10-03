import cx from 'classnames'
import * as d3 from 'd3'
import { sumBy } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Nullable, truncateNumberToRange } from 'uiSrc/utils'
import { rgb, RGBColor } from 'uiSrc/utils/colors'
import { getPercentage } from 'uiSrc/utils/numbers'

import styles from './styles.module.scss'

export interface ChartData {
  value: number
  name: string
  color: RGBColor
  meta?: {
    [key: string]: any
  }
}

interface IProps {
  name?: string
  data: ChartData[]
  width?: number
  height?: number
  title?: React.ReactElement | string
  config?: {
    percentToShowLabel?: number
    arcWidth?: number
    margin?: number
    radius?: number
  }
  classNames?: {
    chart?: string
    arc?: string
    arcLabel?: string
    arcLabelValue?: string
    tooltip?: string
  }
  renderLabel?: (data: ChartData) => string
  renderTooltip?: (data: ChartData) => React.ReactElement | string
  labelAs?: 'value' | 'percentage'
}

const ANIMATION_DURATION_MS = 100

const DonutChart = (props: IProps) => {
  const {
    name = '',
    data,
    width = 380,
    height = 300,
    title,
    config,
    classNames,
    labelAs = 'value',
    renderLabel,
    renderTooltip,
  } = props

  const margin = config?.margin || 98
  const radius = config?.radius || (width / 2 - margin)
  const arcWidth = config?.arcWidth || 8
  const percentToShowLabel = config?.percentToShowLabel || 5

  const [hoveredData, setHoveredData] = useState<Nullable<ChartData>>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const sum = sumBy(data, 'value')

  const arc = d3.arc<d3.PieArcDatum<ChartData>>()
    .outerRadius(radius)
    .innerRadius(radius - arcWidth)

  const arcHover = d3.arc<d3.PieArcDatum<ChartData>>()
    .outerRadius(radius + 4)
    .innerRadius(radius - arcWidth)

  const onMouseEnterSlice = (e: MouseEvent, d: d3.PieArcDatum<ChartData>) => {
    d3
      .select<SVGPathElement, d3.PieArcDatum<ChartData>>(e.target as SVGPathElement)
      .transition()
      .duration(ANIMATION_DURATION_MS)
      .attr('d', arcHover)

    if (!tooltipRef.current) {
      return
    }

    // calculate position after tooltip rendering (do update as synchronous operation)
    if (e.type === 'mouseenter') {
      flushSync(() => { setHoveredData(d.data) })
    }

    tooltipRef.current.style.top = `${e.pageY + 15}px`
    tooltipRef.current.style.left = (window.innerWidth < (tooltipRef.current.scrollWidth + e.pageX + 20))
      ? `${e.pageX - tooltipRef.current.scrollWidth - 15}px`
      : `${e.pageX + 15}px`
    tooltipRef.current.style.visibility = 'visible'
  }

  const onMouseLeaveSlice = (e: MouseEvent) => {
    d3
      .select<SVGPathElement, d3.PieArcDatum<ChartData>>(e.target as SVGPathElement)
      .transition()
      .duration(ANIMATION_DURATION_MS)
      .attr('d', arc)

    if (tooltipRef.current) {
      tooltipRef.current.style.visibility = 'hidden'
      setHoveredData(null)
    }
  }

  const isShowLabel = (d: d3.PieArcDatum<ChartData>) =>
    d.endAngle - d.startAngle > (Math.PI * 2) / (100 / percentToShowLabel)

  const getLabelPosition = (d: d3.PieArcDatum<ChartData>) => {
    const [x, y] = arc.centroid(d)
    const h = Math.sqrt(x * x + y * y)
    return `translate(${(x / h) * (radius + 16)}, ${((y + 4) / h) * (radius + 16)})`
  }

  useEffect(() => {
    const pie = d3.pie<ChartData>().value((d: ChartData) => d.value).sort(null)
    const dataReady = pie(data.filter((d) => d.value !== 0))

    d3
      .select(svgRef.current)
      .select('g')
      .remove()

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('data-testid', `donut-${name}`)
      .attr('class', cx(classNames?.chart))
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // add arcs
    svg
      .selectAll()
      .data(dataReady)
      .enter()
      .append('path')
      .attr('data-testid', (d) => `arc-${d.data.name}-${d.data.value}`)
      .attr('d', arc)
      .attr('fill', (d) => rgb(d.data.color))
      .attr('class', cx(styles.arc, classNames?.arc))
      .on('mouseenter mousemove', onMouseEnterSlice)
      .on('mouseleave', onMouseLeaveSlice)

    // add labels
    svg
      .selectAll()
      .data(dataReady)
      .enter()
      .append('text')
      .attr('class', cx(styles.chartLabel, classNames?.arcLabel))
      .attr('transform', getLabelPosition)
      .text((d) => (isShowLabel(d) ? d.data.name : ''))
      .attr('data-testid', (d) => `label-${d.data.name}-${d.data.value}`)
      .style('text-anchor', (d) => ((d.endAngle + d.startAngle) / 2 > Math.PI ? 'end' : 'start'))
      .on('mouseenter mousemove', onMouseEnterSlice)
      .on('mouseleave', onMouseLeaveSlice)
      .append('tspan')
      .text((d) => {
        if (!isShowLabel(d)) {
          return ''
        }

        if (renderLabel) {
          return renderLabel(d.data)
        }

        const separator = ': '
        if (labelAs === 'percentage') {
          return `${separator}${getPercentage(d.value, sum)}%`
        }

        return `${separator}${truncateNumberToRange(d.value)}`
      })
      .attr('class', cx(styles.chartLabelValue, classNames?.arcLabelValue))
  }, [data])

  if (!data.length || sum === 0) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <svg ref={svgRef} />
      <div
        className={cx(styles.tooltip, classNames?.tooltip)}
        data-testid="chart-value-tooltip"
        ref={tooltipRef}
      >
        {(renderTooltip && hoveredData) ? renderTooltip(hoveredData) : (hoveredData?.value || '')}
      </div>
      {title && (
        <div className={styles.innerTextContainer}>
          {title}
        </div>
      )}
    </div>
  )
}

export default DonutChart
