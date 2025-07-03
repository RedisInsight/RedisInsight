import React from 'react'
import {
  LoaderBar,
  LoaderBarProps,
  LoaderContainer,
} from './progress-bar-loader.styles'

const ProgressBarLoader = ({ className, style, ...rest }: LoaderBarProps) => (
  <LoaderContainer
    className={className}
    style={style}
  >
    <LoaderBar {...rest} />
  </LoaderContainer>
)

export default ProgressBarLoader
