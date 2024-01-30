import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useParams, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Pages } from 'uiSrc/constants'

import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, sendPageViewTelemetry, TelemetryEvent, TelemetryPageView } from 'uiSrc/telemetry'

import {
  appContextTriggeredFunctions,
  setLastTriggeredFunctionsPage
} from 'uiSrc/slices/app/context'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { incrementOnboardStepAction } from 'uiSrc/slices/app/features'
import { OnboardingSteps } from 'uiSrc/constants/onboarding'
import TriggeredFunctionsPageRouter from './TriggeredFunctionsPageRouter'
import TriggeredFunctionsTabs from './components/TriggeredFunctionsTabs'

import styles from './styles.modules.scss'

export interface Props {
  routes: any[]
}

const TriggeredFunctionsPage = ({ routes = [] }: Props) => {
  const { name: connectedInstanceName, db } = useSelector(connectedInstanceSelector)
  const { lastViewedPage } = useSelector(appContextTriggeredFunctions)

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)
  const pathnameRef = useRef<string>('')

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const { pathname } = useLocation()
  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Triggers and Functions`)

  useEffect(() => () => {
    dispatch(setLastTriggeredFunctionsPage(pathnameRef.current))

    // as here is the last step of onboarding, we set next step when move from the page
    // remove it when triggers&functions won't be the last page
    dispatch(incrementOnboardStepAction(
      OnboardingSteps.Finish,
      0,
      () => {
        sendEventTelemetry({
          event: TelemetryEvent.ONBOARDING_TOUR_FINISHED,
          eventData: {
            databaseId: instanceId
          }
        })
      }
    ))
  }, [])

  useEffect(() => {
    if (pathname === Pages.triggeredFunctions(instanceId)) {
      if (pathnameRef.current && pathnameRef.current !== lastViewedPage) {
        history.push(pathnameRef.current)
        return
      }

      // restore from context
      if (lastViewedPage) {
        history.push(lastViewedPage)
        return
      }

      history.push(Pages.triggeredFunctionsFunctions(instanceId))
    }

    pathnameRef.current = pathname === Pages.triggeredFunctions(instanceId) ? '' : pathname
  }, [pathname])

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.TRIGGERED_FUNCTIONS,
      databaseId: instanceId
    })
    setIsPageViewSent(true)
  }

  const path = pathname?.split('/').pop() || ''

  return (
    <div className={styles.main}>
      <TriggeredFunctionsTabs path={path} />
      <TriggeredFunctionsPageRouter routes={routes} />
      <div className={styles.onboardAnchor}>
        <OnboardingTour
          options={ONBOARDING_FEATURES.FINISH}
          anchorPosition="downCenter"
          panelClassName={styles.onboardPanel}
        >
          <span />
        </OnboardingTour>
      </div>
    </div>
  )
}

export default TriggeredFunctionsPage
