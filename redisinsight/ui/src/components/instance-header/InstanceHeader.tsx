import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiToolTip, EuiSwitch, EuiSwitchEvent } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { connectedInstanceOverviewSelector, connectedInstanceSelector } from 'uiSrc/slices/instances'
import ShortInstanceInfo from 'uiSrc/components/instance-header/components/ShortInstanceInfo'
import DatabaseOverviewWrapper from 'uiSrc/components/database-overview/DatabaseOverviewWrapper'
import { changeKeyViewType, keysSelector } from 'uiSrc/slices/keys'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'

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
  const { viewType } = useSelector(keysSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const history = useHistory()
  const [windowDimensions, setWindowDimensions] = useState(0)

  const dispatch = useDispatch()

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

  const onChangeKeyViewType = (e: EuiSwitchEvent) => {
    dispatch(changeKeyViewType(!e.target.checked ? KeyViewType.List : KeyViewType.Tree))
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
            <div style={{ paddingLeft: '10px' }}>
              <EuiSwitch
                label="Tree view"
                checked={viewType !== KeyViewType.List}
                onChange={(e) => onChangeKeyViewType(e)}
              />
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
