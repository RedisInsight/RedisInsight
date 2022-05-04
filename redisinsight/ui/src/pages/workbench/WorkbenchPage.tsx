import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { PageNames } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { setLastPageContext } from 'uiSrc/slices/app/context'
import { loadPluginsAction } from 'uiSrc/slices/app/plugins'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { appAnalyticsInfoSelector } from 'uiSrc/slices/app/info'
import WBViewWrapper from './components/wb-view'

const WorkbenchPage = () => {
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)
  const { identified: analyticsIdentified } = useSelector(appAnalyticsInfoSelector)

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()
  setTitle(`${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Workbench`)

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent && analyticsIdentified) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent, analyticsIdentified])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.WORKBENCH_PAGE,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  useEffect(() => {
    dispatch(loadPluginsAction())
  }, [])

  useEffect(() => () => {
    dispatch(setLastPageContext(PageNames.workbench))
  })

  return (<WBViewWrapper />)
}

export default WorkbenchPage
