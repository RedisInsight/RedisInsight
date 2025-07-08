import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  appFeatureOnboardingSelector,
  setOnboardNextStep,
  skipOnboarding,
} from 'uiSrc/slices/app/features'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

const OnboardingStartPopover = () => {
  const { id: connectedInstanceId = '' } = useSelector(
    connectedInstanceSelector,
  )
  const { isActive, currentStep } = useSelector(appFeatureOnboardingSelector)
  const dispatch = useDispatch()

  const sendTelemetry = (action: string) =>
    sendEventTelemetry({
      event: TelemetryEvent.ONBOARDING_TOUR_CLICKED,
      eventData: {
        databaseId: connectedInstanceId,
        step: OnboardingStepName.Start,
        action,
      },
    })

  const handleSkip = () => {
    dispatch(skipOnboarding())
    sendTelemetry('closed')
  }

  const handleStart = () => {
    dispatch(setOnboardNextStep())
    sendTelemetry('next')
  }

  return (
    <RiPopover
      button={<></>}
      isOpen={isActive && currentStep === OnboardingSteps.Start}
      ownFocus={false}
      closePopover={() => {}}
      panelClassName={styles.onboardingStartPopover}
      anchorPosition="upCenter"
      data-testid="onboarding-start-popover"
    >
      <Title size="S">Take a quick tour of Redis Insight?</Title>
      <Spacer size="s" />
      <Text data-testid="onboarding-start-content">
        Hi! Redis Insight has many tools that can help you to optimize the
        development process.
        <br />
        Would you like us to show them to you?
      </Text>
      <div className={styles.onboardingActions}>
        <EmptyButton
          onClick={handleSkip}
          className={styles.skipTourBtn}
          size="small"
          data-testid="skip-tour-btn"
        >
          Skip tour
        </EmptyButton>
        <PrimaryButton
          onClick={handleStart}
          color="secondary"
          size="s"
          data-testid="start-tour-btn"
        >
          Show me around
        </PrimaryButton>
      </div>
    </RiPopover>
  )
}

export default OnboardingStartPopover
