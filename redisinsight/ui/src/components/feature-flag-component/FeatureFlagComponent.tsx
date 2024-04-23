import React from 'react'
import { isArray } from 'lodash'
import { useSelector } from 'react-redux'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export interface Props {
  name: string
  children: JSX.Element | JSX.Element[]
  otherwise?: React.ReactElement
  flagDefault?: boolean
}

const FeatureFlagComponent = (props: Props) => {
  const { children, name, otherwise, flagDefault = false } = props
  const { [name]: feature } = useSelector(appFeatureFlagsFeaturesSelector)
  const { flag, variant } = feature ?? { flag: flagDefault }

  if (!flag) {
    return otherwise ?? null
  }

  const cloneElement = (child: React.ReactElement) => React.cloneElement(child, { variant })

  return isArray(children) ? <>{React.Children.map(children, cloneElement)}</> : cloneElement(children)
}

export default FeatureFlagComponent
