import React, { useEffect, useState } from 'react'

import {
  EuiText,
  EuiTourStep,
  EuiButtonEmpty,
  EuiButton, EuiButtonIcon,
} from '@elastic/eui'
import { useDispatch } from 'react-redux'
import cx from 'classnames'

import {
  skipOnboarding,
  setOnboardNextStep,
  setOnboardPrevStep
} from 'uiSrc/slices/app/features'
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
    fullSize
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
        <EuiButtonEmpty
          onClick={handleSkip}
          className={styles.skipTourBtn}
          size="xs"
          data-testid="skip-tour-btn"
        >
          Skip tour
        </EuiButtonEmpty>
      ) : (
        <EuiButtonIcon
          iconType="cross"
          className={styles.skipTourBtn}
          onClick={handleSkip}
          size="xs"
          aria-label="close-tour"
          data-testid="close-tour-btn"
        />
      )}
      <div className={styles.title} data-testid="step-title">{title}</div>
    </div>
  )

  const StepContent = (
    <>
      <div className={styles.content}>
        <EuiText>
          <div data-testid="step-content">{content}</div>
        </EuiText>
      </div>
      <div className={styles.footer}>
        <EuiText color="subdued" className={styles.stepCount}>{currentStep} of {totalSteps}</EuiText>
        <div className={styles.backNext}>
          {currentStep > 1 && (
            <EuiButton
              onClick={handleClickBack}
              color="secondary"
              size="s"
              data-testid="back-btn"
            >
              Back
            </EuiButton>
          )}
          <EuiButton
            onClick={handleClickNext}
            color="secondary"
            size="s"
            fill
            data-testid="next-btn"
            style={{ marginLeft: 8 }}
          >
            {!isLastStep ? 'Next' : 'Take me back'}
          </EuiButton>
        </div>
      </div>
    </>
  )

  return (
    <div
      onClick={handleWrapperClick}
      className={cx(styles.wrapper, anchorWrapperClassName, { [styles.fullSize]: fullSize })}
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
        panelClassName={cx(styles.popoverPanel, panelClassName, { [styles.lastStep]: isLastStep })}
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
