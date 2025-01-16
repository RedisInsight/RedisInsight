import React from 'react'
import { createRoot } from 'react-dom/client'
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon'

import AppRediSearch from './src/AppRediSearch'
import AppRiExplain from './src/AppRiExplain'
import AppTimeSeries from './src/AppTimeSeries'
import AppRedisGraph from './src/AppRedisGraph'
import AppClientList from './src/AppClientList'
import AppReJSON from './src/AppReJSON'
import { ResponseProps } from './src/interfaces'
import { cachedIcons } from './src/utils'

import './src/styles/styles.scss'

appendIconComponentCache(cachedIcons)

const renderApp = (element: JSX.Element, props: ResponseProps) => {
  const FailResponse = HandleFail(props)
  const container = document.getElementById('app')
  const root = createRoot(container!)

  root.render(
    !FailResponse ? element : <>{FailResponse}</>,
  )
}

const renderRediSearch = (props: ResponseProps) => {
  renderApp(
    <div className="redisearch">
      <AppRediSearch {...props} />
    </div>,
    props
  )
}

const renderClientsList = (props: ResponseProps) => {
  renderApp(
    <div className="clientList">
      <AppClientList {...props} />
    </div>,
    props
  )
}

const renderJSON = (props: ResponseProps) => {
  renderApp(
    <div className="rejson">
      <AppReJSON {...props} />
    </div>,
    props
  )
}

const renderRiExplain = (props: ResponseProps) => {
  renderApp(
    <div className="riExplain">
      <AppRiExplain {...props} />
    </div>,
    props
  )
}

const renderChart = (props: ResponseProps) => {
  renderApp(
    <div className="timeseries">
      <AppTimeSeries {...props} />
    </div>,
    props
  )
}

const renderGraphTable = (props: ResponseProps) => {
  renderApp(
    <div className="redisGraph">
      <AppRedisGraph type="table" {...props} />
    </div>,
    props
  )
}

const renderGraph = (props: ResponseProps) => {
  renderApp(
    <div className="redisGraph">
      <AppRedisGraph type="graph" {...props} />
    </div>,
    props
  )
}

function HandleFail(props: ResponseProps): React.ReactNode {
  const { data: [{ response = '', status = '' } = {}] = [] } = props

  if (status === 'fail') {
    return (
      <div className="cli-container">
        <div className="cli-output-response-fail">{JSON.stringify(response)}</div>
      </div>
    )
  }

  return null
}

export default {
  renderRediSearch,
  renderClientsList,
  renderJSON,
  renderRiExplain,
  renderChart,
  renderGraphTable,
  renderGraph,
}
