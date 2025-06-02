import React from 'react'
import { EuiBadge } from '@elastic/eui'

import { GroupBadge } from 'uiSrc/components'
import { CommandGroup } from 'uiSrc/constants'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import { ColorText, Text } from 'uiSrc/components/base/text'
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
      <IconButton
        icon={ArrowLeftIcon}
        onClick={onBackClick}
        data-testid="cli-helper-back-to-list-btn"
        style={{ marginRight: '4px' }}
      />
      <GroupBadge type={group} className={styles.groupBadge} />
      <ColorText
        className={styles.title}
        color="subdued"
        data-testid="cli-helper-title-args"
      >
        {args}
      </ColorText>
      {complexity && (
        <EuiBadge
          className={styles.badge}
          data-testid="cli-helper-complexity-short"
        >
          <Text
            style={{ color: 'white' }}
            className="text-capitalize"
            size="xs"
          >
            {complexity}
          </Text>
        </EuiBadge>
      )}
    </div>
  )
}

export default CHCommandInfo
