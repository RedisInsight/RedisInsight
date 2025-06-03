import React from 'react'
import { EuiTextColor } from '@elastic/eui'

import { GroupBadge } from 'uiSrc/components'
import { CommandGroup } from 'uiSrc/constants'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Row } from 'uiSrc/components/base/layout/flex'
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
    <Row
      align="center"
      className={styles.container}
      data-testid="cli-helper-title"
    >
      <IconButton
        icon={ArrowLeftIcon}
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
        <RiBadge
          label={complexity}
          variant="light"
          className={styles.badge}
          data-testid="cli-helper-complexity-short"
        />
      )}
    </Row>
  )
}

export default CHCommandInfo
