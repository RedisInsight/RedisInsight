/* eslint-disable react/jsx-filename-extension */
import React from 'react'

import ChartResultView from './components/Chart/ChartResultView'

interface Props {
    command: string
    result?: { response: any, status: string }[]
}

const App = (props: Props) => {
  const { result: [{ response = '', status = '' } = {}] = [] } = props

  if (status === 'fail') {
    return <div className="responseFail">{response}</div>
  }

  console.log(props, status, typeof(response))

  if (status === 'success' && typeof(response) === 'string') {
    return <div className="responseFail">{response}</div>
  }

  function responseParser(data: any) {
    return data.map(e => ({
      key: e[0],
      labels: e[1],
      datapoints: e[2],
    }))
  }

  return (
    <ChartResultView
      data={responseParser(props.result[0].response) as any}
    />
  )
}

export default App
