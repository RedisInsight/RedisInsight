import { useSelector } from 'react-redux'
import React from 'react'
import { PopoverAnchorPosition } from '@elastic/eui/src/components/popover/popover'
import { appFeatureOnboardingSelector } from 'uiSrc/slices/app/features'

import OnboardingTour from './OnboardingTour'
import { OnboardingTourOptions } from './interfaces'

export interface Props {
  options: OnboardingTourOptions
  children: React.ReactElement
  anchorPosition?: PopoverAnchorPosition
  panelClassName?: string
  anchorWrapperClassName?: string
  preventPropagation?: boolean
  fullSize?: boolean
}

const OnboardingTourWrapper = (props: Props) => {
  const { options, children } = props
  const { step } = options
  const { currentStep, isActive, totalSteps } = useSelector(appFeatureOnboardingSelector)

  // render tour only when it needed due to side effect calls
  return step === currentStep && isActive
    ? (
      <OnboardingTour
        currentStep={currentStep}
        totalSteps={totalSteps}
        isActive={isActive}
        {...props}
      >
        {children}
      </OnboardingTour>
    ) : children
}

export default OnboardingTourWrapper
