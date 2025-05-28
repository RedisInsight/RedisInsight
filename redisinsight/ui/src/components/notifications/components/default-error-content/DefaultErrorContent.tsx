import { EuiTextColor } from '@elastic/eui'
import React from 'react'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
  onClose?: () => void
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text, onClose = () => {} }: Props) => (
  <>
    <EuiTextColor color="ghost">{text}</EuiTextColor>
    <Spacer />
    <SecondaryButton
      inverted
      onClick={onClose}
      data-testid="toast-cancel-btn"
      className="toast-danger-btn"
    >
      Ok
    </SecondaryButton>
  </>
)

export default DefaultErrorContent
