import React from 'react'
import { EuiIcon, EuiText } from '@elastic/eui'
import cx from 'classnames'

import { ConnectionType } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  connectionType?: ConnectionType
  isSpublishNotSupported: boolean
}

const EmptyMessagesList = ({ connectionType, isSpublishNotSupported }: Props) => (
  <div className={styles.container} data-testid="empty-messages-list">
    <div className={cx(styles.content, { [styles.contentCluster]: connectionType === ConnectionType.Cluster })}>
      <EuiText className={styles.title}>No messages to display</EuiText>
      <EuiText className={styles.summary}>
        Subscribe to the Channel to see all the messages published to your database
      </EuiText>
      <EuiText className={styles.alert}>
        <EuiIcon type="alert" className={styles.alertIcon} />
        Running in production may decrease performance and memory available
      </EuiText>
      {(connectionType === ConnectionType.Cluster && isSpublishNotSupported) && (
        <>
          <div className={styles.separator} />
          <EuiText className={styles.cluster} data-testid="empty-messages-list-cluster">
            {'Messages published with '}
            <span className={styles.badge}>
              SPUBLISH
            </span>
            {' will not appear in this channel'}
          </EuiText>
        </>
      )}
    </div>
  </div>
)

export default EmptyMessagesList
