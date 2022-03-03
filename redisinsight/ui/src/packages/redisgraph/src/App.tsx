import React from 'react'
import { JSONTree } from 'react-json-tree'
import { ResultsParser } from './parser'
import Graph from './Graph'
import { Table } from './Table'

const isDarkTheme = document.body.classList.contains('theme_DARK')

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

export function TableApp(props: { command?: string, data: any }) {

  const ErrorResponse = HandleError(props)

  if (ErrorResponse !== null) return ErrorResponse

  const tableData = ResultsParser(props.data[0].response as any)

  return (
      <div className="table-view">
          <Table
              data={tableData.results}
              columns={tableData.headers.map(h => ({
                  field: h,
                  name: h,
                  render: d => (
                      <JSONTree
                          invertTheme={isDarkTheme}
                          theme={{
                              extend: json_tree_theme,
                              tree: ({ style }) => ({
                                  style: { ...style, backgroundColor: undefined }, // removing default background color from styles
                              }),
                          }}
                          labelRenderer={(key) => key ? key : null}
                          hideRoot
                          data={d}
                      />
                  )
              }))}
          />
      </div>
  )
}


export function GraphApp(props: { command?: string, data: any }) {

  const ErrorResponse = HandleError(props)

  if (ErrorResponse !== null) return ErrorResponse

  return (
    <div style={{ height: "100%" }}>
      <Graph graphKey={props.command.split(' ')[1]} data={props.data[0].response} />
    </div>
  )
}

function HandleError(props: { command?: string, data: any }): JSX.Element {
  const { data: [{ response = '', status = '' } = {}] = [] } = props

  if (status === 'fail') {
    return <div className="responseFail">{JSON.stringify(response)}</div>
  }

  if (status === 'success' && typeof(response) === 'string') {
    return <div className="responseFail">{JSON.stringify(response)}</div>
  }

  const command = props.command.split(' ')

  if (command[command.length - 1] === '--compact') {
    return <div className="responseFail">Queries with '--compact' flag is currently not supported.</div>
  }

  return null
}
