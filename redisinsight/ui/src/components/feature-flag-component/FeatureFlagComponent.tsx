import React from 'react'
import { isArray } from 'lodash'
import { useSelector } from 'react-redux'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export interface Props {
  name: FeatureFlags
  children?: JSX.Element | JSX.Element[]
  otherwise?: React.ReactElement
  enabledByDefault?: boolean
}

const FeatureFlagComponent = (props: Props) => {
  const { children, name, otherwise, enabledByDefault } = props
  const { [name]: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const { flag, variant } = feature ?? { flag: enabledByDefault }

  if (!flag) {
    return otherwise ?? null
  }

  if (!children) {
    return null
  }

  const cloneElement = (child: React.ReactElement) => React.cloneElement(child, { variant })

  return isArray(children) ? <>{React.Children.map(children, cloneElement)}</> : cloneElement(children)
}

export default FeatureFlagComponent
