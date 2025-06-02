import React from 'react'
import { ColorText } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'

export interface Props {
  text: string | JSX.Element | JSX.Element[]
  onClose?: () => void
}
// TODO: use i18n file for texts
const DefaultErrorContent = ({ text, onClose = () => {} }: Props) => (
  <>
    <ColorText color="ghost">{text}</ColorText>
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
