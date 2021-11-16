/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import response from './response.json'
import App from './App'

interface Props {
  command?: string
  data?: any
  status?: string
}

const renderClientsList = (props:Props) => {
  const { command = '', status = '', data: response = {} } = props
  render(<App command={command} response={response} status={status} />,
    document.getElementById('app'))
}

if (process.env.NODE_ENV === 'development') {
  renderClientsList({ command: '', data: response, status: 'success' })
}

export default { renderClientsList }
