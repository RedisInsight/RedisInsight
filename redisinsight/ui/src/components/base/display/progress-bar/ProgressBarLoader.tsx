import React from 'react'
import {
  LoaderBar,
  ProgressBarLoaderProps,
  LoaderContainer,
} from './progress-bar-loader.styles'

const ProgressBarLoader = ({
  className,
  style,
  color,
}: ProgressBarLoaderProps) => (
  <LoaderContainer className={className} style={style}>
    <LoaderBar color={color} />
  </LoaderContainer>
)

export default ProgressBarLoader
