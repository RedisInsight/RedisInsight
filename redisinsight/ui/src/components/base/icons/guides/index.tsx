import React from 'react'
import { Icon, IconProps } from 'uiSrc/components/base/icons'

import ProbabilisticDataSvg from 'uiSrc/assets/img/guides/probabilistic-data.svg?react'
import JSONSvg from 'uiSrc/assets/img/guides/json.svg?react'
import VectorSimilaritySvg from 'uiSrc/assets/img/guides/vector-similarity.svg?react'

export const ProbabilisticDataIcon = (props: IconProps) => (
  <Icon icon={ProbabilisticDataSvg} {...props} isSvg />
)

export const JSONIcon = (props: IconProps) => (
  <Icon icon={JSONSvg} {...props} isSvg />
)

export const VectorSimilarityIcon = (props: IconProps) => (
  <Icon icon={VectorSimilaritySvg} {...props} isSvg />
)
