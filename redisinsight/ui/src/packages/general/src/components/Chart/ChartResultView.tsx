import React, { useState } from 'react'
import { TimeSeries, YAxisConfig, ChartConfig, AxisScale, GraphMode } from './interfaces'
import ChartConfigForm from './ChartConfigForm'
import Chart from './Chart'

enum LoyoutState {
  INITIAL_STATE,
  RELAYOUT_STATE,
}

interface ChartResultViewProps {
  data: TimeSeries[]
}

export default function ChartResultView(props: ChartResultViewProps) {
  const defaultYAxisConfig: YAxisConfig = { label: '', scale: AxisScale.linear }
  const keyToY2AxisDefault = props.data.reduce((keyToYAxis: any, timeSeries) => {
    keyToYAxis[timeSeries.key] = false
    return keyToYAxis
  }, {})

  const [chartConfig, setChartConfig] = useState<ChartConfig>({
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
  const [chartState, setChartState] = useState<LoyoutState>(LoyoutState.INITIAL_STATE)

  function handleChartConfigChanged(control: string, value: any) {
    onChartConfigChange(control, value)
    if (chartState !== LoyoutState.INITIAL_STATE) {
      setChartState(LoyoutState.INITIAL_STATE)
    }
  }

  function onChartConfigChange(control: string, value: any) {
    setChartConfig({ ...chartConfig, [control]: value })
  }

  function onRelayout() {
    if (chartState !== LoyoutState.RELAYOUT_STATE) {
      setChartState(LoyoutState.RELAYOUT_STATE)
    }
  }

  function onDoubleClick() {
    if (chartState !== LoyoutState.INITIAL_STATE) {
      setChartState(LoyoutState.INITIAL_STATE)
    }
  }

  return (
    <div>
      <div className="zoom-helper-text">
        <i>
          {
            chartState === LoyoutState.INITIAL_STATE
              ? 'Drag over the part of the chart to zoom into it'
              : 'Double click on the graph to reset the view'
          }
        </i>
      </div>
      <Chart
        chartConfig={chartConfig}
        data={props.data}
        onRelayout={onRelayout}
        onDoubleClick={onDoubleClick}
      />
      <div className="config-form-wrapper">
        <ChartConfigForm
          value={chartConfig}
          onChange={handleChartConfigChanged}
        />
      </div>
    </div>
  )
}
