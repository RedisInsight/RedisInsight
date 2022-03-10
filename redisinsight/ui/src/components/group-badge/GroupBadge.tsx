import React from 'react'
import { EuiBadge, EuiText } from '@elastic/eui'
import { CommandGroup, KeyTypes, GROUP_TYPES_COLORS, GROUP_TYPES_DISPLAY } from 'uiSrc/constants'

export interface Props {
  type: KeyTypes | CommandGroup | string;
  name?: string,
  className?: string
}

const GroupBadge = ({ type, name = '', className = '' }: Props) => (
  <EuiBadge
    style={{ backgroundColor: GROUP_TYPES_COLORS[type] ?? '#14708D' }}
    className={className}
    data-testid={`badge-${type} ${name}`}
  >
    <EuiText style={{ color: 'var(--euiTextSubduedColorHover)' }} className="text-uppercase" size="xs">
      {type ? (GROUP_TYPES_DISPLAY as any)[type] ?? type?.replace(/_/g, ' ') : ''}
    </EuiText>
  </EuiBadge>
)

export default GroupBadge
