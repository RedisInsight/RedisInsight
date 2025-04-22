import React from 'react'
import {
  EuiButtonIcon,
  EuiLink,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Col, FlexItem } from 'uiSrc/components/base/layout/Flex'
import CreateRedisearchIndex from './CreateRedisearchIndex'

import styles from './styles.module.scss'

export interface Props {
  arePanelsCollapsed?: boolean
  onClosePanel?: () => void
  onCreateIndex?: () => void
}

const CreateRedisearchIndexWrapper = ({
  arePanelsCollapsed,
  onClosePanel,
  onCreateIndex,
}: Props) => (
  <div className={styles.page} data-testid="create-index-panel">
    <Col justify="center" className={cx(styles.container, 'relative')}>
      <div className={styles.headerWrapper}>
        <FlexItem grow style={{ marginBottom: '16px' }}>
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
        </FlexItem>
        <FlexItem grow className={styles.header}>
          <EuiText size="s">
            Use CLI or Workbench to create more advanced indexes. See more
            details in the{' '}
            <EuiLink
              color="text"
              href={getUtmExternalLink('https://redis.io/commands/ft.create/', {
                campaign: 'browser_search',
              })}
              className={styles.link}
              external={false}
              target="_blank"
            >
              documentation.
            </EuiLink>
          </EuiText>
        </FlexItem>
      </div>
      <CreateRedisearchIndex
        onCreateIndex={onCreateIndex}
        onClosePanel={onClosePanel}
      />
    </Col>
  </div>
)

export default CreateRedisearchIndexWrapper
