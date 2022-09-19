import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import AnalyticsPageRouter from './AnalyticsPageRouter'

export interface Props {
  routes: any[];
}

const AnalyticsPage = ({ routes = [] }: Props) => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()
  const { connectionType } = useSelector(connectedInstanceSelector)

  useEffect(() => {
    if (pathname === Pages.analytics(instanceId)) {
      // history.push(connectionType === ConnectionType.Cluster
      //   ? Pages.clusterDetails(instanceId)
      //   : Pages.slowLog(instanceId))
      history.push(Pages.clusterDetails(instanceId))
    }
  }, [connectionType, instanceId, pathname])

  return (
    <AnalyticsPageRouter routes={routes} />
  )
}

export default AnalyticsPage
