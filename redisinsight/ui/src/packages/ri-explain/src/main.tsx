/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { App } from './App'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { icon as EuiIconClock } from '@elastic/eui/es/components/icon/assets/clock';
import { icon as EuiIconIInCircle } from '@elastic/eui/es/components/icon/assets/iInCircle';

appendIconComponentCache({
  clock: EuiIconClock,
  iInCircle: EuiIconIInCircle,
})

const renderApp = (element: JSX.Element) => render(
  element,
  document.getElementById('app')
)

const renderCore = (props: Props) => renderApp(
  <App data={props.data} command={props.command} />
)

// This is a required action - export the main function for execution of the visualization
export default { renderCore }
