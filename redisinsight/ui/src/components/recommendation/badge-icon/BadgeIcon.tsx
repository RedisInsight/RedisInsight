import React from 'react'
import { EuiToolTip } from '@elastic/eui'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  id: string
  icon: React.ReactElement
  name: string
}
const BadgeIcon = ({ id, icon, name }: Props) => (
  <FlexItem key={id} data-testid={`recommendation-badge-${id}`}>
    <Row gap="m" align="center" data-testid={id}>
      <EuiToolTip
        content={name}
        position="top"
        display="inlineBlock"
        anchorClassName="flex-row"
      >
        {icon}
      </EuiToolTip>
    </Row>
  </FlexItem>
)

export default BadgeIcon
