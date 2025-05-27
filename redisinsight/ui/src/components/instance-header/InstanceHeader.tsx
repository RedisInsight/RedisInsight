import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  EuiButtonEmpty,
  EuiFieldNumber,
  EuiIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'

import { FeatureFlags, Pages } from 'uiSrc/constants'
import { selectOnFocus, validateNumber } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BuildType } from 'uiSrc/constants/env'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  checkDatabaseIndexAction,
  connectedInstanceInfoSelector,
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import {
  appContextDbIndex,
  clearBrowserKeyListData,
  setBrowserSelectedKey,
} from 'uiSrc/slices/app/context'

import { DatabaseOverview, FeatureFlagComponent } from 'uiSrc/components'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import ShortInstanceInfo from 'uiSrc/components/instance-header/components/ShortInstanceInfo'

import { resetKeyInfo } from 'uiSrc/slices/browser/keys'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { getConfig } from 'uiSrc/config'
import { appReturnUrlSelector } from 'uiSrc/slices/app/url-handling'
import UserProfile from 'uiSrc/components/instance-header/components/user-profile/UserProfile'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import InstancesNavigationPopover from './components/instances-navigation-popover'
import styles from './styles.module.scss'

const riConfig = getConfig()
const { returnUrlBase, returnUrlLabel, returnUrlTooltip } = riConfig.app

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
    modules = [],
  } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { server } = useSelector(appInfoSelector)
  const { disabled: isDbIndexDisabled } = useSelector(appContextDbIndex)
  const { databases = 0 } = useSelector(connectedInstanceInfoSelector)
  const returnUrl = useSelector(appReturnUrlSelector)
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
    [FeatureFlags.envDependent]: envDependentFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([
    databaseChatFeature,
    documentationChatFeature,
  ])

  const history = useHistory()
  const [dbIndex, setDbIndex] = useState<string>(String(db || 0))
  const [isDbIndexEditing, setIsDbIndexEditing] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setDbIndex(String(db || 0))
  }, [db])

  const isRedisStack = server?.buildType === BuildType.RedisStack

  const goHome = () => {
    history.push(Pages.home)
  }

  const goToReturnUrl = () => {
    const fullUrl = `${returnUrlBase}${returnUrl}`
    document.location = fullUrl
  }

  const handleChangeDbIndex = () => {
    setIsDbIndexEditing(false)

    if (db === +dbIndex) return

    dispatch(
      checkDatabaseIndexAction(
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
              nextIndex: +dbIndex,
            },
          })
        },
        () => setDbIndex(String(db)),
      ),
    )
  }

  return (
    <div className={cx(styles.container)}>
      <Row
        responsive
        align="center"
        justify="between"
        style={{ height: '100%' }}
      >
        <FlexItem style={{ overflow: 'hidden' }} grow={false}>
          <div
            className={styles.breadcrumbsContainer}
            data-testid="breadcrumbs-container"
          >
            <div>
              <FeatureFlagComponent name={FeatureFlags.envDependent}>
                <EuiToolTip
                  position="bottom"
                  content={
                    server?.buildType === BuildType.RedisStack
                      ? 'Edit database'
                      : 'Redis Databases'
                  }
                >
                  <EuiText
                    className={styles.breadCrumbLink}
                    aria-label={
                      server?.buildType === BuildType.RedisStack
                        ? 'Edit database'
                        : 'Redis Databases'
                    }
                    data-testid="my-redis-db-btn"
                    onClick={goHome}
                    onKeyDown={goHome}
                  >
                    Databases
                  </EuiText>
                </EuiToolTip>
              </FeatureFlagComponent>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ maxWidth: '100%' }}>
                <Row align="center">
                  <FeatureFlagComponent name={FeatureFlags.envDependent}>
                    <FlexItem>
                      <EuiText className={styles.divider}>/</EuiText>
                    </FlexItem>
                  </FeatureFlagComponent>
                  {returnUrlBase && returnUrl && (
                    <FeatureFlagComponent
                      name={FeatureFlags.envDependent}
                      otherwise={
                        <FlexItem
                          style={{ padding: '4px 24px 4px 0' }}
                          data-testid="return-to-sm-item"
                        >
                          <EuiToolTip
                            position="bottom"
                            content={returnUrlTooltip || returnUrlLabel}
                          >
                            <EuiText
                              className={styles.breadCrumbLink}
                              aria-label={returnUrlTooltip || returnUrlLabel}
                              onClick={goToReturnUrl}
                              onKeyDown={goToReturnUrl}
                            >
                              &#60; {returnUrlLabel}
                            </EuiText>
                          </EuiToolTip>
                        </FlexItem>
                      }
                    />
                  )}
                  <FlexItem grow style={{ overflow: 'hidden' }}>
                    {isRedisStack || !envDependentFeature?.flag ? (
                      <b className={styles.dbName}>{name}</b>
                    ) : (
                      <InstancesNavigationPopover name={name} />
                    )}
                  </FlexItem>
                  {databases > 1 && (
                    <FlexItem style={{ padding: '4px 0 4px 12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
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
                                onChange={(e) =>
                                  setDbIndex(
                                    validateNumber(e.target.value.trim()),
                                  )
                                }
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
                            <span
                              style={{
                                fontSize: 14,
                                marginBottom: '-2px',
                              }}
                            >
                              db{db || 0}
                            </span>
                          </EuiButtonEmpty>
                        )}
                      </div>
                    </FlexItem>
                  )}
                  <FlexItem style={{ paddingLeft: 6 }}>
                    <EuiToolTip
                      position="right"
                      anchorClassName={styles.tooltipAnchor}
                      className={styles.tooltip}
                      content={
                        <ShortInstanceInfo
                          info={{
                            name,
                            host,
                            port,
                            user: username,
                            connectionType,
                            version,
                            dbIndex: db,
                          }}
                          modules={modules}
                          databases={databases}
                        />
                      }
                    >
                      <EuiIcon
                        className={styles.infoIcon}
                        type="iInCircle"
                        size="l"
                        style={{ cursor: 'pointer' }}
                        data-testid="db-info-icon"
                      />
                    </EuiToolTip>
                  </FlexItem>
                </Row>
              </div>
            </div>
          </div>
        </FlexItem>

        <FlexItem style={{ textAlign: 'center' }}>
          <DatabaseOverview />
        </FlexItem>

        <FlexItem>
          <Row align="center" justify="end">
            {isAnyChatAvailable && (
              <FlexItem style={{ marginLeft: 12 }}>
                <CopilotTrigger />
              </FlexItem>
            )}

            <FlexItem style={{ marginLeft: 12 }}>
              <InsightsTrigger />
            </FlexItem>

            <UserProfile />
          </Row>
        </FlexItem>
      </Row>
    </div>
  )
}

export default InstanceHeader
