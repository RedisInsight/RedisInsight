/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right'
import App from './App'

appendIconComponentCache({
    arrowRight: EuiIconArrowRight,
})

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

const renderChart = (props:Props) => {
  const { command = '', data: result = [] } = props
  render(
    <App command={command} result={result} />,
    document.getElementById('app')
  )
}

if (process.env.NODE_ENV === 'development') {
  renderChart({ command: '', data: [] })
}

// This is a required action - export the main function for execution of the visualization
export default { renderChart }
