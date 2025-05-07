import React from 'react'
import { OutlineButtonProps } from 'uiSrc/components/base/forms/buttons/button.styles'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons/SecondaryButton'

export const OutlineButton = (props: OutlineButtonProps) => (
  <SecondaryButton {...props} filled={false} />
)
