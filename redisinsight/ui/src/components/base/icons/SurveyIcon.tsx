import React from 'react'
import SurveySvg from 'uiSrc/assets/img/survey_icon.svg?react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

export const SurveyIcon = (props: IconProps) => (
  <Icon icon={SurveySvg} {...props} isSvg />
)
