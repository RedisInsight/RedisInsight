import React from 'react'
import { JSONTree } from 'react-json-tree'
import { ResultsParser } from './modules/Graph/parser'
import Graph from './modules/Graph/Graph'
import { Table } from './modules/Graph/Table'
import { COMPACT_FLAG } from './modules/Graph/constants'
import { ResponseProps } from './interfaces'

const isDarkTheme = document.body.classList.contains('theme_DARK')

const JSON_TREE_THEME = {
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

interface Props extends ResponseProps {
  type: 'table' | 'graph'
}

const AppRedisGraph = ({ type, ...props }: Props) => {
  switch (type) {
    case 'table':
      return <TableView {...props} />

    case 'graph':
    default:
      return <GraphView {...props} />
  }
}

export function TableView(props: ResponseProps) {
  const ErrorResponse = HandleError(props)

  if (ErrorResponse !== null) return ErrorResponse

  const tableData = ResultsParser(props.data[0].response as any)

  return (
    <div className="table-view">
      <Table
        data={tableData.results}
        columns={tableData.headers.map((h) => ({
          field: h,
          name: h,
          render: (d) => (
            <JSONTree
              invertTheme={isDarkTheme}
              theme={{
                extend: JSON_TREE_THEME,
                tree: ({ style }) => ({
                  style: { ...style, backgroundColor: undefined }, // removing default background color from styles
                }),
              }}
              labelRenderer={(key) => (key || null)}
              hideRoot
              data={d}
            />
          )
        }))}
      />
    </div>
  )
}

export function GraphView(props: ResponseProps) {
  const { data, command = '' } = props
  const ErrorResponse = HandleError(props)

  if (ErrorResponse !== null) return ErrorResponse

  return (
    <div style={{ height: '100%' }}>
      <Graph graphKey={command.split(' ')[1]} data={data?.[0].response} command={command} />
    </div>
  )
}

function HandleError(props: ResponseProps): React.ReactNode {
  const { command = '', data: [{ response = '', status = '' } = {}] = [] } = props

  if (status === 'success' && typeof (response) === 'string') {
    return <div className="responseFail">{JSON.stringify(response)}</div>
  }

  // const command = props.command.split(' ')
  const commandArr = command.split(' ')

  if (commandArr[commandArr.length - 1] === COMPACT_FLAG) {
    return <div className="responseFail">&apos;{COMPACT_FLAG}&apos; flag is currently not supported.</div>
  }

  return null
}

export default AppRedisGraph
