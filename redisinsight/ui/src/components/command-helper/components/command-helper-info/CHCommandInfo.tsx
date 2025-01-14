import React from 'react'
import { EuiBadge, EuiButtonIcon, EuiText, EuiTextColor } from '@elastic/eui'

import { GroupBadge } from 'uiSrc/components'
import { CommandGroup } from 'uiSrc/constants'

import styles from './styles.module.scss'

export interface Props {
  args: string
  group: CommandGroup | string
  complexity: string
  onBackClick: () => void
}

const CHCommandInfo = (props: Props) => {
  const {
    args = '',
    group = CommandGroup.Generic,
    complexity = '',
    onBackClick,
  } = props

  return (
    <div className={styles.container} data-testid="cli-helper-title">
      <EuiButtonIcon
        iconType="sortLeft"
        onClick={onBackClick}
        data-testid="cli-helper-back-to-list-btn"
        style={{ marginRight: '4px' }}
      />
      <GroupBadge type={group} className={styles.groupBadge} />
      <EuiTextColor
        className={styles.title}
        color="subdued"
        data-testid="cli-helper-title-args"
      >
        {args}
      </EuiTextColor>
      {complexity && (
        <EuiBadge
          className={styles.badge}
          data-testid="cli-helper-complexity-short"
        >
          <EuiText
            style={{ color: 'white' }}
            className="text-capitalize"
            size="xs"
          >
            {complexity}
          </EuiText>
        </EuiBadge>
      )}
    </div>
  )
}

export default CHCommandInfo
