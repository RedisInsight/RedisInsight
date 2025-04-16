import cx from 'classnames'
import React from 'react'
import { EuiBadge, EuiButtonIcon, EuiText } from '@elastic/eui'
import { CommandGroup, KeyTypes, GROUP_TYPES_COLORS } from 'uiSrc/constants'
import { getGroupTypeDisplay } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  type: KeyTypes | CommandGroup | string
  name?: string
  className?: string
  compressed?: boolean
  onDelete?: (type: string) => void
}

const GroupBadge = ({
  type,
  name = '',
  className = '',
  onDelete,
  compressed,
}: Props) => (
  <EuiBadge
    style={{
      backgroundColor: GROUP_TYPES_COLORS[type] ?? 'var(--defaultTypeColor)',
    }}
    className={cx(styles.badgeWrapper, className, {
      [styles.withDeleteBtn]: onDelete,
      [styles.compressed]: compressed,
    })}
    title={undefined}
    data-testid={`badge-${type}_${name}`}
  >
    {!compressed && (
      <EuiText
        style={{ color: 'var(--euiTextSubduedColorHover)' }}
        className="text-uppercase"
        size="xs"
      >
        {getGroupTypeDisplay(type)}
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
