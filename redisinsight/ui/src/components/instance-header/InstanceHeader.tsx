import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { connectedInstanceOverviewSelector, connectedInstanceSelector } from 'uiSrc/slices/instances'
import ShortInstanceInfo from 'uiSrc/components/instance-header/components/ShortInstanceInfo'
import DatabaseOverviewWrapper from 'uiSrc/components/database-overview/DatabaseOverviewWrapper'

import styles from './styles.module.scss'

const InstanceHeader = () => {
  const {
    name = '',
    host = '',
    port = '',
    username,
    connectionType = ConnectionType.Standalone,
    db = 0
  } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const history = useHistory()
  const [windowDimensions, setWindowDimensions] = useState(0)

  useEffect(() => {
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
    }
  }, [])

  const updateWindowDimensions = () => {
    setWindowDimensions(globalThis.innerWidth)
  }

  const goHome = () => {
    history.push(Pages.home)
  }

  return (
    <div className={cx(styles.container)}>
      <EuiFlexGroup gutterSize="none" responsive={false}>
        <EuiFlexItem style={{ overflow: 'hidden' }}>
          <div className={styles.breadcrumbsContainer} data-testid="breadcrumbs-container">
            <div>
              <EuiToolTip
                position="bottom"
                content="My Redis databases"
              >
                <EuiButtonIcon
                  display="empty"
                  size="s"
                  iconSize="l"
                  iconType="sortLeft"
                  aria-label="My Redis databases"
                  data-testid="my-redis-db-icon"
                  onClick={goHome}
                />
              </EuiToolTip>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <EuiToolTip
                position="right"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                content={(
                  <ShortInstanceInfo
                    info={{
                      name, host, port, user: username, connectionType, version, dbIndex: db
                    }}
                  />
                )}
              >
                <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
                  <EuiFlexItem style={{ overflow: 'hidden' }}>
                    <b className={styles.dbName}>{db > 0 ? `${name} [${db}]` : name}</b>
                  </EuiFlexItem>
                  <EuiFlexItem style={{ paddingLeft: 12 }} grow={false}>
                    <EuiIcon
                      className={styles.infoIcon}
                      type="iInCircle"
                      size="l"
                      style={{ cursor: 'pointer' }}
                      data-testid="db-info-icon"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiToolTip>
            </div>
          </div>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <DatabaseOverviewWrapper windowDimensions={windowDimensions} />
        </EuiFlexItem>
      </EuiFlexGroup>

    </div>
  )
}

export default InstanceHeader
