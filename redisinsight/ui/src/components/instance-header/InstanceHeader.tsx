import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  EuiButtonEmpty,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiToolTip,
  EuiText,
} from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { BuildType } from 'uiSrc/constants/env'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  checkDatabaseIndexAction,
  connectedInstanceInfoSelector,
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import ShortInstanceInfo from 'uiSrc/components/instance-header/components/ShortInstanceInfo'
import DatabaseOverviewWrapper from 'uiSrc/components/database-overview/DatabaseOverviewWrapper'

import { appContextDbIndex, clearBrowserKeyListData, setBrowserSelectedKey } from 'uiSrc/slices/app/context'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import InsightsTrigger from 'uiSrc/components/insights-trigger'
import { selectOnFocus, validateNumber } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { resetKeyInfo } from 'uiSrc/slices/browser/keys'

import styles from './styles.module.scss'

export interface Props {
  onChangeDbIndex?: (index: number) => void
}

const InstanceHeader = ({ onChangeDbIndex }: Props) => {
  const {
    name = '',
    host = '',
    port = '',
    username,
    connectionType = ConnectionType.Standalone,
    db = 0,
    id,
    loading: instanceLoading,
    modules = []
  } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { server } = useSelector(appInfoSelector)
  const { disabled: isDbIndexDisabled } = useSelector(appContextDbIndex)
  const { databases = 0 } = useSelector(connectedInstanceInfoSelector)
  const history = useHistory()
  const [dbIndex, setDbIndex] = useState<string>(String(db || 0))
  const [isDbIndexEditing, setIsDbIndexEditing] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => { setDbIndex(String(db || 0)) }, [db])

  const goHome = () => {
    history.push(Pages.home)
  }

  const handleChangeDbIndex = () => {
    setIsDbIndexEditing(false)

    if (db === +dbIndex) return

    dispatch(checkDatabaseIndexAction(
      id,
      +dbIndex,
      () => {
        dispatch(clearBrowserKeyListData())
        onChangeDbIndex?.(+dbIndex)
        dispatch(resetKeyInfo())
        dispatch(setBrowserSelectedKey(null))

        sendEventTelemetry({
          event: TelemetryEvent.BROWSER_DATABASE_INDEX_CHANGED,
          eventData: {
            databaseId: id,
            prevIndex: db,
            nextIndex: +dbIndex
          }
        })
      },
      () => setDbIndex(String(db))
    ))
  }

  return (
    <div className={cx(styles.container)}>
      <EuiFlexGroup gutterSize="none" responsive={false}>
        <EuiFlexItem style={{ overflow: 'hidden' }}>
          <div className={styles.breadcrumbsContainer} data-testid="breadcrumbs-container">
            <div>
              <EuiToolTip
                position="bottom"
                content={server?.buildType === BuildType.RedisStack ? 'Edit database' : 'My Redis databases'}
              >
                <EuiText
                  className={styles.breadCrumbLink}
                  aria-label={server?.buildType === BuildType.RedisStack ? 'Edit database' : 'My Redis databases'}
                  data-testid="my-redis-db-btn"
                  onClick={goHome}
                  onKeyDown={goHome}
                >
                  Databases
                </EuiText>
              </EuiToolTip>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ maxWidth: '100%' }}>
                <EuiFlexGroup gutterSize="none" alignItems="center" responsive={false}>
                  <EuiFlexItem grow={false}>
                    <EuiText className={styles.divider}>&#62;</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem style={{ overflow: 'hidden' }}>
                    <b className={styles.dbName}>{name}</b>
                  </EuiFlexItem>
                  {databases > 1 && (
                    <EuiFlexItem style={{ padding: '4px 0 4px 12px' }} grow={false}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isDbIndexEditing ? (
                          <div style={{ marginRight: 48 }}>
                            <InlineItemEditor
                              controlsPosition="right"
                              onApply={handleChangeDbIndex}
                              onDecline={() => setIsDbIndexEditing(false)}
                              viewChildrenMode={false}
                              controlsClassName={styles.controls}
                            >
                              <EuiFieldNumber
                                onFocus={selectOnFocus}
                                onChange={(e) => setDbIndex(validateNumber(e.target.value.trim()))}
                                value={dbIndex}
                                placeholder="Database Index"
                                className={styles.input}
                                fullWidth={false}
                                compressed
                                autoComplete="off"
                                type="text"
                                data-testid="change-index-input"
                              />
                            </InlineItemEditor>
                          </div>
                        ) : (
                          <EuiButtonEmpty
                            iconType="pencil"
                            iconSide="right"
                            onClick={() => setIsDbIndexEditing(true)}
                            className={styles.buttonDbIndex}
                            disabled={isDbIndexDisabled || instanceLoading}
                            data-testid="change-index-btn"
                          >
                            <span style={{ fontSize: 14, marginBottom: '-2px' }}>db{db || 0}</span>
                          </EuiButtonEmpty>
                        )}
                      </div>
                    </EuiFlexItem>
                  )}
                  <EuiFlexItem style={{ paddingLeft: 6 }} grow={false}>
                    <EuiToolTip
                      position="right"
                      anchorClassName={styles.tooltipAnchor}
                      className={styles.tooltip}
                      content={(
                        <ShortInstanceInfo
                          info={{
                            name, host, port, user: username, connectionType, version, dbIndex: db
                          }}
                          modules={modules}
                          databases={databases}
                        />
                      )}
                    >
                      <EuiIcon
                        className={styles.infoIcon}
                        type="iInCircle"
                        size="l"
                        style={{ cursor: 'pointer' }}
                        data-testid="db-info-icon"
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </div>
          </div>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <DatabaseOverviewWrapper />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <InsightsTrigger />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default InstanceHeader
