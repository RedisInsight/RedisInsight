/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import App from './App'

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
import { icon as EuiIconCheck } from '@elastic/eui/es/components/icon/assets/check';

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
  check: EuiIconCheck,
})

import { EuiProvider } from '@elastic/eui';

const isDarkTheme = document.body.classList.contains('theme_DARK')

const renderChart = (props:Props) => {
  const { command = '', data: result = [] } = props
  render(
    <EuiProvider colorMode={isDarkTheme ? "dark" : "light"}>
      <App command={command} result={result} />
    </EuiProvider>
    ,
    document.getElementById('app'))
}

if (process.env.NODE_ENV === 'development') {
  renderChart({ command: '', data: [] })
}

// This is a required action - export the main function for execution of the visualization
export default { renderChart }
