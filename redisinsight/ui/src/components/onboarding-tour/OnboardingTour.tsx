import React, { useEffect, useState } from 'react'

import { EuiTourStep } from '@elastic/eui'
import { useDispatch } from 'react-redux'
import cx from 'classnames'

import {
  skipOnboarding,
  setOnboardNextStep,
  setOnboardPrevStep,
} from 'uiSrc/slices/app/features'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import {
  EmptyButton,
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Props as OnboardingWrapperProps } from './OnboardingTourWrapper'

import styles from './styles.module.scss'

export interface Props extends OnboardingWrapperProps {
  isActive: boolean
  currentStep: number
  totalSteps: number
}

const OnboardingTour = (props: Props) => {
  const {
    options,
    children,
    anchorPosition = 'rightUp',
    panelClassName,
    anchorWrapperClassName,
    isActive,
    currentStep,
    totalSteps,
    preventPropagation,
    fullSize,
  } = props
  const { step, title, Inner } = options
  const {
    content = '',
    onBack = () => {},
    onNext = () => {},
    onSkip = () => {},
  } = Inner ? Inner() : {}

  const [isOpen, setIsOpen] = useState(step === currentStep && isActive)
  const isLastStep = currentStep === totalSteps

  const dispatch = useDispatch()

  useEffect(() => {
    setIsOpen(step === currentStep && isActive)
  }, [currentStep, isActive])

  const handleClickBack = () => {
    onBack?.()
    dispatch(setOnboardPrevStep())
  }

  const handleClickNext = () => {
    onNext?.()
    dispatch(setOnboardNextStep())
  }

  const handleSkip = () => {
    onSkip?.()
    dispatch(skipOnboarding())
  }

  const handleWrapperClick = (e: React.MouseEvent) => {
    if (preventPropagation) {
      e.stopPropagation()
    }
  }

  const Header = (
    <div className={styles.header}>
      {!isLastStep ? (
        <EmptyButton
          onClick={handleSkip}
          className={styles.skipTourBtn}
          size="small"
          data-testid="skip-tour-btn"
        >
          Skip tour
        </EmptyButton>
      ) : (
        <IconButton
          icon={CancelSlimIcon}
          className={styles.skipTourBtn}
          onClick={handleSkip}
          size="S"
          aria-label="close-tour"
          data-testid="close-tour-btn"
        />
      )}
      <div className={styles.title} data-testid="step-title">
        {title}
      </div>
    </div>
  )

  const StepContent = (
    <>
      <div className={styles.content}>
        <Text>
          <div data-testid="step-content">{content}</div>
        </Text>
      </div>
      <div className={styles.footer}>
        <Text color="subdued" className={styles.stepCount}>
          {currentStep} of {totalSteps}
        </Text>
        <div className={styles.backNext}>
          {currentStep > 1 && (
            <SecondaryButton
              onClick={handleClickBack}
              size="s"
              data-testid="back-btn"
            >
              Back
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={handleClickNext}
            size="s"
            data-testid="next-btn"
            style={{ marginLeft: 8 }}
          >
            {!isLastStep ? 'Next' : 'Take me back'}
          </PrimaryButton>
        </div>
      </div>
    </>
  )

  return (
    <div
      onClick={handleWrapperClick}
      className={cx(styles.wrapper, anchorWrapperClassName, {
        [styles.fullSize]: fullSize,
      })}
      role="presentation"
    >
      <EuiTourStep
        content={StepContent}
        decoration="none"
        isStepOpen={isOpen}
        minWidth={300}
        onFinish={() => setIsOpen(false)}
        step={step}
        stepsTotal={totalSteps}
        title=""
        subtitle={Header}
        anchorPosition={anchorPosition}
        className={styles.popover}
        anchorClassName={styles.popoverAnchor}
        panelClassName={cx(styles.popoverPanel, panelClassName, {
          [styles.lastStep]: isLastStep,
        })}
        zIndex={9999}
        offset={5}
        data-testid="onboarding-tour"
      >
        {children}
      </EuiTourStep>
    </div>
  )
}

export default OnboardingTour
