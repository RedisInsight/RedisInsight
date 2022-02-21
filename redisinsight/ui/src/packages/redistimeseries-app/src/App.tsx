/* eslint-disable react/jsx-filename-extension */
import React, {useState} from 'react'


interface Props {
  command: string
  result?: { response: any, status: string }[]
}

import { response1 } from './response'
import Chart from './components/Chart/Chart'
import ChartResultView from './components/Chart/ChartResultView'

import { TimeSeries, YAxisConfig, ChartConfig, AxisScale, GraphMode } from './components/Chart/interfaces'

interface ChartResultViewState {
    chartConfig: ChartConfig
}

const App = (props: Props) => {
  const { command = '', result: [{ response = '', status = '' } = {}] = [] } = props

  const data= response1.result

  const defaultYAxisConfig: YAxisConfig = { label: '', scale: AxisScale.linear }
  const keyToY2AxisDefault = data.reduce((keyToYAxis: any, timeSeries) => {
    keyToYAxis[timeSeries.key] = false
    return keyToYAxis
  }, {})

  const [chartConfig, setChartConfig] = useState({
    mode: GraphMode.line,
    title: '',
    xlabel: '',
    staircase: false,
    fill: true,
    yAxis2: false,
    keyToY2Axis: keyToY2AxisDefault,
    yAxisConfig: defaultYAxisConfig,
    yAxis2Config: defaultYAxisConfig,
  })

  function responseParser(data: any) {
    return data.map(e => ({
      key: e[0],
      labels: e[1],
      datapoints: e[2],
    }))
  }


    /* return (
    *     <Chart
    *         chartConfig={chartConfig}
    *         data={data as any}
    *     />
    * ) */

  return (
        <ChartResultView
          data={responseParser(props.result[0].response) as any}
        />
  )

    /* const result = parseResponse(response)
    
    * if (status === 'fail') {
    *   return <div className="responseFail">{response}</div>
    * }
    
    * return <TableResult query={command} result={result} /> */
}

export default App
