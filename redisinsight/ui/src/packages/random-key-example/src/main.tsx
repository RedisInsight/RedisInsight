/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import App from './App'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

const renderRandomKey = (props:Props) => {
  const { data: result = [] } = props
  render(<App result={result} />,
    document.getElementById('app'))
}

if (process.env.NODE_ENV === 'development') {
  renderRandomKey({ data: [{ response: 'key132', status: 'success' }] })
}

// This is a required action - export the main function for execution of the visualization
export default { renderRandomKey }
