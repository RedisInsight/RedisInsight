import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import { useLocation, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import InstanceHeader from 'uiSrc/components/instance-header'

import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'

import TriggeredFunctionsPageRouter from './TriggeredFunctionsPageRouter'
import TriggeredFunctionsTabs from './components/TriggeredFunctionsTabs'

import styles from './styles.modules.scss'

export interface Props {
  routes: any[]
}

const TriggeredFunctionsPage = ({ routes = [] }: Props) => {
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)
  const pathnameRef = useRef<string>('')

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Triggers & Functions`)

  useEffect(() => {
    if (pathname === Pages.triggeredFunctions(instanceId)) {
      if (pathnameRef.current === Pages.triggeredFunctionsLibraries(instanceId)) {
        history.push(pathnameRef.current)
        return
      }

      history.push(Pages.triggeredFunctionsFunctions(instanceId))
    }

    pathnameRef.current = pathname === Pages.triggeredFunctions(instanceId) ? '' : pathname
  }, [pathname])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.TRIGGERED_FUNCTIONS,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  const path = pathname?.split('/').pop() || ''

  return (
    <>
      <InstanceHeader />
      <div className={styles.main}>
        <TriggeredFunctionsTabs path={path} />
        <TriggeredFunctionsPageRouter routes={routes} />
      </div>
    </>
  )
}

export default TriggeredFunctionsPage
