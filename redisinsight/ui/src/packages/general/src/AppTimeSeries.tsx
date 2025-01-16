import React from 'react'
import ChartResultView from './components/Chart/ChartResultView'
import { ResponseProps } from './interfaces'

enum TsCmdRangePrefix {
  RANGE = 'TS.RANGE',
  REVRANGE = 'TS.REVRANGE',
}

const AppTimeSeries = (props: ResponseProps) => {
  const { command, data: [{ response = '', status = '' } = {}] = [] } = props

  if (status === 'success' && typeof (response) === 'string') {
    return <div className="responseFail">{response}</div>
  }

  function responseParser(command: string, data: any) {
    const [cmd, key] = command.split(' ')

    if (Object.values(TsCmdRangePrefix).includes(cmd.toUpperCase() as TsCmdRangePrefix)) {
      return [{
        key,
        datapoints: data,
      }]
    }

    return data.map((e: any) => ({
      key: e[0],
      labels: e[1],
      datapoints: e[2],
    }))
  }

  return (
    <ChartResultView
      data={responseParser(command, response) as any}
    />
  )
}

export default AppTimeSeries
