import React from 'react'
import { useSelector } from 'react-redux'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export interface Props {
  name: FeatureFlags
  children: React.ReactElement
  otherwise?: React.ReactElement
}

const FeatureFlagComponent = (props: Props) => {
  const { children, name, otherwise } = props
  const { [name]: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const { flag, variant } = feature ?? { flag: false }

  return flag ? React.cloneElement(children, { variant }) : otherwise ?? null
}

export default FeatureFlagComponent
