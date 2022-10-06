import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import InstanceHeader from 'uiSrc/components/instance-header'
import { Pages } from 'uiSrc/constants'
import { appContextAnalytics, setLastAnalyticsPage } from 'uiSrc/slices/app/context'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import AnalyticsPageRouter from './AnalyticsPageRouter'

import styles from './styles.module.scss'

export interface Props {
  routes: any[]
}

const AnalyticsPage = ({ routes = [] }: Props) => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const { pathname } = useLocation()
  const { connectionType } = useSelector(connectedInstanceSelector)
  const { lastViewedPage } = useSelector(appContextAnalytics)

  const pathnameRef = useRef<string>(pathname)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(setLastAnalyticsPage(pathnameRef.current))
  }, [])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    // restore page from context or set default
    if (lastViewedPage) {
      history.push(lastViewedPage)
      return
    }

    if (pathname === Pages.analytics(instanceId)) {
      history.push(connectionType === ConnectionType.Cluster
        ? Pages.clusterDetails(instanceId)
        : Pages.databaseAnalysis(instanceId))
    }
  }, [connectionType, instanceId, lastViewedPage, pathname])

  return (
    <>
      <InstanceHeader />
      <div className={styles.main}>
        <AnalyticsPageRouter routes={routes} />
      </div>
    </>
  )
}

export default AnalyticsPage
