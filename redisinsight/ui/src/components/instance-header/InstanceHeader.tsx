import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiToolTip } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { connectedInstanceOverviewSelector, connectedInstanceSelector } from 'uiSrc/slices/instances'
import ShortInstanceInfo from 'uiSrc/components/instance-header/components/ShortInstanceInfo'
import DatabaseOverviewWrapper from 'uiSrc/components/database-overview/DatabaseOverviewWrapper'

import styles from './styles.module.scss'

const InstanceHeader = () => {
  const { name = '', username, connectionType = ConnectionType.Standalone, db = 0 } = useSelector(connectedInstanceSelector)
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
          <div className={styles.breadcrumbsContainer}>
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
                  onClick={goHome}
                />
              </EuiToolTip>
            </div>
            <div style={{ maxWidth: '80%', flex: 1 }}>
              <EuiToolTip
                position="bottom"
                anchorClassName={styles.tooltipAnchor}
                className={styles.tooltip}
                content={(
                  <ShortInstanceInfo
                    name={name}
                    user={username}
                    connectionType={connectionType}
                    version={version}
                    dbIndex={db}
                  />
                )}
              >
                <b className={styles.dbName}>{db > 0 ? `${name} [${db}]` : name}</b>
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
