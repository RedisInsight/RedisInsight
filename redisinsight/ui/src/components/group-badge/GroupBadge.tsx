import cx from 'classnames'
import React from 'react'
import { EuiBadge, EuiButtonIcon, EuiText } from '@elastic/eui'
import { CommandGroup, KeyTypes, GROUP_TYPES_COLORS, GROUP_TYPES_DISPLAY } from 'uiSrc/constants'

import styles from './styles.module.scss'

export interface Props {
  type: KeyTypes | CommandGroup | string
  fill?: boolean
  name?: string
  className?: string
  compressed?: boolean
  onDelete?: (type: string) => void
}

const GroupBadge = ({ type, fill = true, name = '', className = '', onDelete, compressed }: Props) => (
  <EuiBadge
    style={{ backgroundColor: (fill ? GROUP_TYPES_COLORS[type] : '') ?? '#14708D', borderColor: GROUP_TYPES_COLORS[type] ?? '#14708D' }}
    className={cx(
      styles.badgeWrapper,
      className,
      { [styles.withDeleteBtn]: onDelete, [styles.compressed]: compressed }
    )}
    title={undefined}
    data-testid={`badge-${type}_${name}`}
  >
    {!compressed && (
      <EuiText style={{ color: 'var(--euiTextSubduedColorHover)' }} className="text-uppercase" size="xs">
        {type ? (GROUP_TYPES_DISPLAY as any)[type] ?? type?.replace(/_/g, ' ') : ''}
      </EuiText>
    )}
    {onDelete && (
      <EuiButtonIcon
        size="xs"
        iconType="cross"
        color="primary"
        aria-label="Delete"
        onClick={() => onDelete(type)}
        className={styles.deleteIcon}
        data-testid={`${type}-delete-btn`}
      />
    )}
  </EuiBadge>
)

export default GroupBadge
