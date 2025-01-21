/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'
import { icon as EuiIconMagnifyWithPlus } from '@elastic/eui/es/components/icon/assets/magnifyWithPlus'
import { icon as EuiIconMagnifyWithMinus } from '@elastic/eui/es/components/icon/assets/magnifyWithMinus'
import { icon as EuiIconBullsEye } from '@elastic/eui/es/components/icon/assets/bullseye'
import { icon as EuiIconEditorItemAlignCenter } from '@elastic/eui/es/components/icon/assets/editorItemAlignCenter'
import { icon as EuiIconClock } from '@elastic/eui/es/components/icon/assets/clock'
import { icon as EuiIconReportingApp } from '@elastic/eui/es/components/icon/assets/app_reporting'
import { icon as EuiIconArrowUp } from '@elastic/eui/es/components/icon/assets/arrow_up'
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down'
import { App } from './App'
import './styles/styles.scss'
import result from '../mockData/resultExplain.json'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

appendIconComponentCache({
  magnifyWithPlus: EuiIconMagnifyWithPlus,
  magnifyWithMinus: EuiIconMagnifyWithMinus,
  bullseye: EuiIconBullsEye,
  editorItemAlignCenter: EuiIconEditorItemAlignCenter,
  clock: EuiIconClock,
  reportingApp: EuiIconReportingApp,
  arrowUp: EuiIconArrowUp,
  arrowDown: EuiIconArrowDown,
})

const renderApp = (element: JSX.Element) => render(
  element,
  document.getElementById('app')
)

const renderCore = (props: Props) => renderApp(
  <App data={props.data} command={props.command} />
)

if (process.env.NODE_ENV === 'development') {
  const command = 'GRAPH.EXPLAIN us_government "MATCH (p:President)-[:BORN]->(h:State {name:\'Hawaii\'}) RETURN p"'
  renderCore({ command, data: result, mode: 'ASCII' })
}

// This is a required action - export the main function for execution of the visualization
export default { renderCore }
