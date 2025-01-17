/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import { GraphApp, TableApp } from './App'
import './styles/styles.scss'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { icon as EuiIconMagnifyWithPlus } from '@elastic/eui/es/components/icon/assets/magnifyWithPlus';
import { icon as EuiIconMagnifyWithMinus } from '@elastic/eui/es/components/icon/assets/magnifyWithMinus';
import { icon as EuiIconBullsEye } from '@elastic/eui/es/components/icon/assets/bullseye';
import { icon as EuiIconEditorItemAlignLeft } from '@elastic/eui/es/components/icon/assets/editorItemAlignLeft';
import { icon as EuiIconEditorItemAlignRight } from '@elastic/eui/es/components/icon/assets/editorItemAlignRight';
import { icon as EuiIconEditorItemAlignCenter } from '@elastic/eui/es/components/icon/assets/editorItemAlignCenter';
import { icon as EuiIconArrowLeft } from '@elastic/eui/es/components/icon/assets/arrow_left';
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right';
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as EuiIconCross } from '@elastic/eui/es/components/icon/assets/cross';

appendIconComponentCache({
  magnifyWithPlus: EuiIconMagnifyWithPlus,
  magnifyWithMinus: EuiIconMagnifyWithMinus,
  bullseye: EuiIconBullsEye,
  editorItemAlignLeft: EuiIconEditorItemAlignLeft,
  editorItemAlignRight: EuiIconEditorItemAlignRight,
  editorItemAlignCenter: EuiIconEditorItemAlignCenter,
  arrowLeft: EuiIconArrowLeft,
  arrowRight: EuiIconArrowRight,
  arrowDown: EuiIconArrowDown,
  cross: EuiIconCross,
})

const renderApp = (element: JSX.Element) => render(
  element,
  document.getElementById('app')
)

const renderGraphTable = (props: Props) => renderApp(
  <TableApp data={props.data} command={props.command} />
)

const renderGraph = (props: Props) => renderApp(
  <GraphApp data={props.data} command={props.command} />
)

// This is a required action - export the main function for execution of the visualization
export default { renderGraphTable, renderGraph }
