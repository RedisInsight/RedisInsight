/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import result from './result2.json'
// import result from './resultInfo.json'
// import result from './result3.json'
import App from './App'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

const renderRediSearch = (props:Props) => {
  const { command = '', data: result = [] } = props
  render(<App command={command} result={result} />,
    document.getElementById('app'))
}

if (process.env.NODE_ENV === 'development') {
  const command = 'ft.search idx'
  // const command = 'ft.info idx'

  renderRediSearch({ command, data: result })
}

export default { renderRediSearch }
