import React from 'react'
import { EuiIcon, EuiToolTip, EuiToolTipProps, ToolTipPositions } from '@elastic/eui'

export interface AppendInfoProps extends Omit<EuiToolTipProps, 'children' | 'delay' | 'position'> {
  position?: ToolTipPositions
}
const AppendInfo = ({ title, content, ...rest }: AppendInfoProps) => (
  <EuiToolTip
    anchorClassName="inputAppendIcon"
    position="right"
    title={title}
    content={content}
    {...rest}
  >
    <EuiIcon
      type="iInCircle"
      style={{ cursor: 'pointer' }}
      data-testid="append-info-icon"
    />
  </EuiToolTip>
)

export default AppendInfo
