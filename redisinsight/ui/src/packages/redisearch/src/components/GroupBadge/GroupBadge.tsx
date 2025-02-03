import React from 'react'
import { EuiBadge, EuiText } from '@elastic/eui'
import { GROUP_TYPES_COLORS, GROUP_TYPES_DISPLAY } from '../../constants'

export interface Props {
  type: any
  name?: string
  className?: string
}

const GroupBadge = ({ type, name = '', className = '' }: Props) => (
  <EuiBadge
    style={{ backgroundColor: GROUP_TYPES_COLORS[type] ?? '#14708D' }}
    className={className}
    data-testid={`badge-${type} ${name}`}
  >
    <EuiText style={{ color: 'var(--euiTextSubduedColorHover)' }} className="text-uppercase" size="xs">
      {GROUP_TYPES_DISPLAY[type] ?? type}
    </EuiText>
  </EuiBadge>
)

export default GroupBadge
