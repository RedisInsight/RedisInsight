export type Datapoint = [number, string]

export interface TimeSeries {
  key: string,
  labels: { [labelName: string]: string }
  datapoints: Datapoint[]
}

export interface TimeSeriesQueryResult {
  query: string
  result?: TimeSeries[]
  msg?: string // msg will be present in case of error
}

export interface TimeSeriesError {
  msg: string
  alt?: string[]
}

export enum GraphMode {
  line = 'line',
  points = 'points',
}

export enum AxisScale {
  linear = 'linear',
  log = 'log',
}

export interface YAxisConfig {
  label: string
  scale: AxisScale
}

export interface ChartConfig {
  mode: GraphMode
  xlabel: string
  title: string
  staircase: boolean
  fill: boolean
  yAxis2: boolean
  keyToY2Axis: { [keyName: string]: boolean }
  yAxisConfig: YAxisConfig
  yAxis2Config: YAxisConfig
}

export type ChartImageExportOption = 'png' | 'svg'
