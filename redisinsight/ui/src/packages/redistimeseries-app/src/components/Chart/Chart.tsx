import React, { useRef, useEffect} from 'react'
import Plotly from 'plotly.js-dist-min'
import { Legend, LayoutAxis, PlotData } from 'plotly.js'
import moment from 'moment'
import fscreen from 'fscreen'
import * as d3Scale from 'd3-scale'
import * as d3ScaleColor from 'd3-scale-chromatic'

import { Datapoint, TimeSeries, ChartConfig, GraphMode, ChartImageExportOption } from './interfaces'
export const X_LABEL_MAX_LENGTH = '60'
export const Y_LABEL_MAX_LENGTH = '30'
export const TITLE_MAX_LENGTH = '60'
export const DOWNLOAD_IMAGE_WIDTH = 1366
export const DOWNLOAD_IMAGE_HEIGHT = 400
export const DOWNLOAD_IMAGE_FILENAME = 'redistimeseries_chart'

export const DOWNLOAD_CSV_FILENAME = 'redistimeseries_data.csv'
export const TIMESERIES_HISTORY_CONTAINER_NAME = 'REDIS_TIMESERIES'

export const AUTO_UPDATE_TIMER_DEFAULT_VALUE = 5000 // time in milliseconds
export const AUTO_UPDATE_NUM_SAMPLES_DEFAULT_VALUE = 50

import { addWatermarkToImageDataURI, ColorPicker, GoodColorPicker } from './utils'
import { saveAs } from 'file-saver'

export function downloadURI(uri, filename) {
    saveAs(uri, filename)
}

const GRAPH_MODE_MAP: { [mode: string]: 'lines' | 'markers' } = {
    [GraphMode.line]: 'lines',
    [GraphMode.points]: 'markers',
}


interface ChartProps {
    data: TimeSeries[]
    chartConfig: ChartConfig
    onRelayout: () => void
    onDoubleClick: () => void
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
      { displayModeBar: false, autosizable: true, responsive: true },
    )

    chartContainer.current.on('plotly_hover', function (eventdata){
      var points = eventdata.points[0],
          pointNum = points.pointNumber;
      Plotly.Fx.hover(
        chartContainer.current,
        props.data.map((_, i) => ({
          curveNumber: i,
          pointNumber: pointNum
      })));
    });
    chartContainer.current.on('plotly_relayout', function (eventdata) {
     if (eventdata.autosize === undefined && eventdata['xaxis.autorange'] === undefined) {
        props.onRelayout()
      }
    });

    chartContainer.current.on('plotly_doubleclick', function(eventdata) {
      props.onDoubleClick()
    })

      // TODO: Refresh the graph without doing a full re-draw. Investigate why using Plotly.relayout() doesn't work.
    fscreen.addEventListener("fullscreenchange", () => Plotly.newPlot(
      chartContainer.current,
      getData(props),
      getLayout(props) as any,
      { displayModeBar: false },
    ))
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
        mode: GRAPH_MODE_MAP[props.chartConfig.mode],
        line: { shape: props.chartConfig.staircase ? 'hv' : 'spline' },
      }
    })
  }

  function getLayout(props: ChartProps) {
    const axisConfig: { [key: string]: Partial<LayoutAxis> } = {
      xaxis: {
        title: props.chartConfig.xlabel,
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
      },
    }

    const legend: Partial<Legend> = {
      xanchor: "center",
      yanchor: "top",
      y: -0.3,
      x: 0.5,
      orientation: 'h',
    }

    return { ...axisConfig, legend, showlegend: true, title: props.chartConfig.title, uirevision: true, autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', bgcolor: '#fff', font: { color: isDarkTheme ? 'white' : 'black' } }
  }

  /* downloadImage(format: ChartImageExportOption) {
   *     const dimensions = {
   *         height: DOWNLOAD_IMAGE_HEIGHT,
   *         width: DOWNLOAD_IMAGE_WIDTH,
   *     }
   *     Plotly.toImage(
   *         this.refs.chartDiv as HTMLElement,
   *         { format: format, ...dimensions }
   *     ).then(imgDataURI => {
   *         addWatermarkToImageDataURI(imgDataURI).then(data =>
   *             downloadURI(data, `${DOWNLOAD_IMAGE_FILENAME}.${format}`)
   *         )
   *     })
   * } */

  function selectCol(twoDArray: Datapoint[], colIndex: number) {
    return twoDArray.map(arr => arr[colIndex])
  }

  return (
    <div ref={chartContainer}></div>
  )
}
