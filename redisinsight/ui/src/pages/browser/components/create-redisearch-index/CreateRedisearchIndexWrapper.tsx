import React from 'react'
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiText,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'
import CreateRedisearchIndex from './CreateRedisearchIndex'

import styles from './styles.module.scss'

export interface Props {
  arePanelsCollapsed?: boolean
  onClosePanel?: () => void
  onCreateIndex?: () => void
}

const CreateRedisearchIndexWrapper = ({ arePanelsCollapsed, onClosePanel, onCreateIndex }: Props) => (
  <div className={styles.page} data-testid="create-index-panel">
    <EuiFlexGroup
      justifyContent="center"
      direction="column"
      className={cx(styles.container, 'relative')}
      gutterSize="none"
      responsive={false}
    >
      <div className={styles.headerWrapper}>
        <EuiFlexItem grow style={{ marginBottom: '16px' }}>
          <EuiTitle size="xs" className={styles.header}>
            <h4>New Index</h4>
          </EuiTitle>
          {!arePanelsCollapsed && (
            <EuiToolTip
              content="Close"
              position="left"
              anchorClassName={styles.closeBtnTooltip}
            >
              <EuiButtonIcon
                iconType="cross"
                color="primary"
                aria-label="Close panel"
                className={styles.closeBtn}
                data-testid="create-index-close-panel"
                onClick={onClosePanel}
              />
            </EuiToolTip>
          )}
        </EuiFlexItem>
        <EuiFlexItem className={styles.header}>
          <EuiText size="s">Use CLI or Workbench to create more advanced indexes. See more details in the
            {' '}
            <EuiLink
              color="text"
              href="https://redis.io/commands/ft.create/"
              className={styles.link}
              external={false}
              target="_blank"
            >
              documentation.
            </EuiLink>
          </EuiText>
        </EuiFlexItem>
      </div>
      <CreateRedisearchIndex
        onCreateIndex={onCreateIndex}
        onClosePanel={onClosePanel}
      />
    </EuiFlexGroup>
  </div>
)

export default CreateRedisearchIndexWrapper
