import React, { useRef, useEffect } from 'react'
import Plotly, { Layout } from 'plotly.js-dist-min'
import { Legend, LayoutAxis, PlotData } from 'plotly.js'
import moment from 'moment'
import * as d3Scale from 'd3-scale'
import * as d3ScaleColor from 'd3-scale-chromatic'
import { hexToRGBA } from './utils'

import { Datapoint, TimeSeries, ChartConfig, GraphMode } from './interfaces'

interface ChartProps {
    data: TimeSeries[]
    chartConfig: ChartConfig
    onRelayout: () => void
    onDoubleClick: () => void
}

const GRAPH_MODE_MAP: { [mode: string]: 'lines' | 'markers' } = {
    [GraphMode.line]: 'lines',
    [GraphMode.points]: 'markers',
}

const isDarkTheme = document.body.classList.contains('theme_DARK')

export default function Chart(props: any) {
  const chartContainer = useRef<any>()

  const colorPicker = d3Scale.scaleOrdinal(props.data.map(t => t.key), d3ScaleColor.schemeDark2)

  useEffect(() => {
    Plotly.newPlot(
      chartContainer.current,
      getData(props),
      getLayout(props) as any,
      { displayModeBar: false, autosizable: true, responsive: true, setBackground: () => 'transparent', },
    )
    chartContainer.current.on('plotly_hover', function (eventdata) {
      var points = eventdata.points[0]
      var pointNum = points.pointNumber
      Plotly.Fx.hover(
        chartContainer.current,
        props.data.map((_, i) => ({
          curveNumber: i,
          pointNumber: pointNum
        })),
        Object.keys((chartContainer.current)._fullLayout._plots))
    })
    chartContainer.current.on('plotly_relayout', function (eventdata) {
     if (eventdata.autosize === undefined && eventdata['xaxis.autorange'] === undefined) {
        props.onRelayout()
      }
    })

    chartContainer.current.on('plotly_doubleclick', function(eventdata) {
      props.onDoubleClick()
    })
  }, [props.chartConfig])

  function getPlotArgs(props: ChartProps) {
    return [
      chartContainer.current,
      getData(props),
      getLayout(props),
      { displayModeBar: false },
    ]
  }

  function getData(props: ChartProps): Partial<PlotData>[] {
    return props.data.map((timeSeries, i) => {

      const currentData = (chartContainer.current as any).data
      const dataUnchanged = currentData && props.data === props.data
      /*
       * Time format for inclusion of milliseconds:
       * https://github.com/moment/moment/issues/4864#issuecomment-440142542
       */
      const x = dataUnchanged ? currentData[i].x
              : selectCol(timeSeries.datapoints, 0).map((time: number) => moment(time).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'))
      const y = dataUnchanged ? currentData[i].y : selectCol(timeSeries.datapoints, 1)

      return {
        x,
        y,
        yaxis: props.chartConfig.yAxis2 && props.chartConfig.keyToY2Axis[timeSeries.key] ? 'y2' : 'y',
        name: timeSeries.key,
        type: 'scatter',
        marker: { color: colorPicker(timeSeries.key) },
        fill: props.chartConfig.fill ? 'tozeroy' : undefined,
        fillcolor: hexToRGBA(colorPicker(timeSeries.key), 0.3),
        mode: GRAPH_MODE_MAP[props.chartConfig.mode],
        line: { shape: props.chartConfig.staircase ? 'hv' : 'spline' },
      }
    })
  }

  function getLayout(props: ChartProps): Partial<Layout> {
    const axisConfig: { [key: string]: Partial<LayoutAxis> } = {
      xaxis: {
        title: props.chartConfig.xlabel,
        rangeslider: {
          visible: true,
          thickness: 0.03,
          bgcolor: isDarkTheme ? 'white' : 'grey',
        }
      },
      yaxis: {
        title: props.chartConfig.yAxisConfig.label,
        type: props.chartConfig.yAxisConfig.scale,
        fixedrange: true,
      },
      yaxis2: {
        visible: props.chartConfig.yAxis2,
        title: props.chartConfig.yAxis2Config.label,
        type: props.chartConfig.yAxis2Config.scale,
        overlaying: 'y',
        side: 'right',
        fixedrange: true,
        color: 'lightblue',
        gridcolor: 'lightblue'
      } as LayoutAxis,
    }

    const legend: Partial<Legend> = {
      xanchor: 'center',
      yanchor: 'top',
      x: 0.5,
      y: -0.3,
      orientation: 'h',
    }
    return {
      ...axisConfig,
      legend,
      showlegend: true,
      title: props.chartConfig.title,
      uirevision: 1,
      autosize: true,
      font: { color: isDarkTheme ? 'darkgrey' : 'black' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        pad: 6
      }
    }
  }

  function selectCol(twoDArray: Datapoint[], colIndex: number) {
    return twoDArray.map(arr => arr[colIndex])
  }

  return (
    <div ref={chartContainer}></div>
  )
}
