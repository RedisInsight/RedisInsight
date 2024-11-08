import { EuiButton, EuiSpacer, EuiTextColor } from '@elastic/eui'
import React from 'react'

export interface Props {
  onClose?: () => void;
}
// TODO: use i18n file for texts
const DefaultErrorContent = (
  {
    onClose = () => {},
  }: Props
) => (
  <>
    <EuiTextColor color="ghost">
      This database does not support the JSON data structure. Learn more about JSON support <a href="https://redis.io/docs/stack/json/about/" target="_blank" rel="noreferrer">here</a>.
      You can also create a <a href="https://redis.io/docs/stack/json/about/" target="_blank" rel="noreferrer">free Redis Cloud database</a> with built-in JSON support.
    </EuiTextColor>
    <EuiSpacer />
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
