import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import InstanceHeader from 'uiSrc/components/instance-header'
import AnalyticsPageRouter from 'uiSrc/pages/analytics/AnalyticsPageRouter'

import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import styles from './styles.modules.scss'

export interface Props {
  routes: any[]
}

const TriggeredFunctionsPage = ({ routes = [] }: Props) => {
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)
  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)
  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Triggers & Functions`)

  useEffect(() => {
    // TODO update routing
    history.push(Pages.triggeredFunctionsLibraries(instanceId))
  }, [])

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

  return (
    <>
      <InstanceHeader />
      <div className={styles.main}>
        <AnalyticsPageRouter routes={routes} />
      </div>
    </>
  )
}

export default TriggeredFunctionsPage
