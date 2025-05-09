import { EuiButton, EuiTextColor } from '@elastic/eui'
import React from 'react'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
  onClose?: () => void
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text, onClose = () => {} }: Props) => (
  <>
    <EuiTextColor color="ghost">{text}</EuiTextColor>
    <Spacer />
    <EuiButton
      fill
      size="s"
      color="warning"
      onClick={onClose}
      data-testid="toast-cancel-btn"
      className="toast-danger-btn"
    >
      Ok
    </EuiButton>
  </>
)

export default DefaultErrorContent
