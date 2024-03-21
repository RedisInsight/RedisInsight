import React from 'react'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTextColor } from '@elastic/eui'

export interface Props {
  message: string
  onClose?: () => void
}

const RdiDeployErrorContent = (props: Props) => {
  const { message, onClose } = props

  return (
    <>
      <EuiTextColor color="ghost">{message}</EuiTextColor>
      <EuiSpacer />
      {/* // TODO remove display none when logs column will be available */}
      <EuiFlexGroup style={{ display: 'none' }} justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            size="s"
            color="warning"
            onClick={() => {}}
            className="toast-danger-btn"
            data-testid="see-errors-btn"
          >
            Remove API key
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default RdiDeployErrorContent
