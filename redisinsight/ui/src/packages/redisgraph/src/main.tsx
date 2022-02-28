/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { render } from 'react-dom'
import result from './result'
import { Table } from './Table'
import { ResultsParser } from './parser'
import Graph from './Graph'
import { JSONTree } from 'react-json-tree'

interface Props {
  command?: string
  data?: { response: any, status: string }[]
}

const isDarkTheme = document.body.classList.contains('theme_DARK')

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

const json_tree_theme = {
    scheme: 'solarized',
    author: 'ethan schoonover (http://ethanschoonover.com/solarized)',
    base00: '#002b36',
    base01: '#073642',
    base02: '#586e75',
    base03: '#657b83',
    base04: '#839496',
    base05: '#93a1a1',
    base06: '#eee8d5',
    base07: '#fdf6e3',
    base08: '#dc322f',
    base09: '#098658',
    base0A: '#b58900',
    base0B: '#A31515',
    base0C: '#2aa198',
    base0D: '#0451A5',
    base0E: '#6c71c4',
    base0F: '#d33682',
}


const renderGraphTable = (props: Props) => {
  const tableData = ResultsParser(props.data[0].response as any)

  render(
    <div className="table-view">
      <Table
        data={tableData.results}
        columns={tableData.headers.map(h => ({
          field: h,
          name: h,
          render: (d: any) => (
            <JSONTree
              invertTheme={isDarkTheme}
              theme={{
                extend: json_tree_theme,
                tree: ({ style }) => ({
                  style: { ...style, backgroundColor: undefined }, // removing default background color from styles
                }),
              }}
              hideRoot
              data={d}
            />
          )
        }))}
      />
    </div>,
    document.getElementById('app'))
}

if (process.env.NODE_ENV === 'development') {
  renderGraphTable({ command: '', data: result || [] })
}

const renderGraph = (props: Props) => {
  render(
      <div style={{ height: "100%" }}>
        <Graph graphKey={props.command.split(' ')[1]} data={props.data[0].response}/>
      </div>,
    document.getElementById('app'))
}

// This is a required action - export the main function for execution of the visualization
export default { renderGraphTable, renderGraph }
