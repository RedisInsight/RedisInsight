import React from 'react'
import { EuiSpacer } from '@elastic/eui'

import { TimeSeries, YAxisConfig, ChartConfig, AxisScale, GraphMode } from './interfaces'
import ChartConfigForm from './ChartConfigForm'
import Chart from './Chart'

enum LAYOUT_STATE {
  INITIAL_STATE,
  RELAYOUT_STATE,
}

/*
 * `chartMiddleChild` is of type `JSX.Element` that when provided will be
 *  placed between the `Chart` Component and the `ChartConfigForm Component.
 */
interface ChartResultViewProps {
    data: TimeSeries[]
}

interface ChartResultViewState {
  chartConfig: ChartConfig
  chartState: LAYOUT_STATE
}

export default class ChartResultView extends React.Component<ChartResultViewProps, ChartResultViewState> {
  constructor(props: ChartResultViewProps) {
    super(props)

    const defaultYAxisConfig: YAxisConfig = { label: '', scale: AxisScale.linear }
    const keyToY2AxisDefault = props.data.reduce((keyToYAxis: any, timeSeries) => {
      keyToYAxis[timeSeries.key] = false
      return keyToYAxis
    }, {})

    this.state = {
      chartConfig: {
        mode: GraphMode.line,
        title: '',
        xlabel: '',
        staircase: false,
        fill: true,
        yAxis2: false,
        keyToY2Axis: keyToY2AxisDefault,
        yAxisConfig: defaultYAxisConfig,
        yAxis2Config: defaultYAxisConfig,
      },
      chartState: LAYOUT_STATE.INITIAL_STATE
    }
  }

  handleChartConfigChanged = (control: string, value: any) => {
    this.onChartConfigChange(control, value)
    if (this.state.chartState !== LAYOUT_STATE.INITIAL_STATE) {
      this.setState({ chartState: LAYOUT_STATE.INITIAL_STATE })
    }
  }


  onChartConfigChange = (control: string, value: any) => {
    const chartConfig = { ...this.state.chartConfig, [control]: value }
    this.setState({ chartConfig })
  }

  onRelayout = (eventData: any) => {
    if (this.state.chartState !== LAYOUT_STATE.RELAYOUT_STATE) {
      this.setState({ chartState: LAYOUT_STATE.RELAYOUT_STATE })
    }
  }

  onDoubleClick = (eventData: any) => {
    if (this.state.chartState !== LAYOUT_STATE.INITIAL_STATE) {
      this.setState({ chartState: LAYOUT_STATE.INITIAL_STATE })
    }
  }


  render() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '3em', paddingTop: '0.3em'}}>
          <i>
            {
              this.state.chartState === LAYOUT_STATE.INITIAL_STATE
              ?
              'Drag over the part of the chart to zoom into it'
              :
              'Double click on the graph to reset the view'
            }
          </i>
        </div>
        <Chart
          chartConfig={this.state.chartConfig}
          data={this.props.data}
          onRelayout={this.onRelayout}
          onDoubleClick={this.onDoubleClick}
        />
        <EuiSpacer size="l" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <ChartConfigForm
            value={this.state.chartConfig} 
            onChange={this.handleChartConfigChanged}
          />
        </div>
      </div>
    )
  }
}
