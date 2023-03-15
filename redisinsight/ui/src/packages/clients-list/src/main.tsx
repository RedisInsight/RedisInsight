/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import result from './result.json'
import App from './App'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

const renderClientsList = (props:Props) => {
  const { command = '', data: result = [] } = props
  render(<App command={command} result={result} />,
    document.getElementById('app'))
}

if (process.env.NODE_ENV === 'development') {
  renderClientsList({ command: '', data: result || [] })
}

// This is a required action - export the main function for execution of the visualization
export default { renderClientsList }
