import React, { ChangeEvent, useState, useEffect, useContext } from 'react'
import { EuiFieldText } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import { useHistory } from 'react-router'

import {
  ArrowLeftIcon,
  CopyIcon,
  DoubleChevronRightIcon,
} from 'uiSrc/components/base/icons'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { getDbIndex, Nullable } from 'uiSrc/utils'
import { Pages, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  changeInstanceAliasAction,
  checkConnectToInstanceAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import {
  appContextSelector,
  resetRdiContext,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import { FlexItem, Grid, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  alias: string
  database?: Nullable<number>
  isLoading: boolean
  onAliasEdited?: (value: string) => void
  isRediStack?: boolean
  isCloneMode: boolean
  id?: string
  setIsCloneMode: (value: boolean) => void
}

const DatabaseAlias = (props: Props) => {
  const {
    alias,
    database,
    id,
    onAliasEdited,
    isLoading,
    isRediStack,
    isCloneMode,
    setIsCloneMode,
  } = props

  const { server } = useSelector(appInfoSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(alias)

  const { theme } = useContext(ThemeContext)
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    setValue(alias)
  }, [alias])

  const setEditMode = () => {
    setIsEditing(true)
  }

  const onChange = ({
    currentTarget: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    isEditing && setValue(value)
  }

  const connectToInstance = () => {
    // reset rdi context
    dispatch(resetRdiContext())

    if (contextInstanceId && contextInstanceId !== id) {
      dispatch(resetKeys())
      dispatch(setAppContextInitialState())
    }
    dispatch(setConnectedInstanceId(id ?? ''))
    history.push(Pages.browser(id ?? ''))
  }

  const handleOpen = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    dispatch(checkConnectToInstanceAction(id, connectToInstance))
    // onOpen()
  }

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsCloneMode(true)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_REQUESTED,
      eventData: {
        databaseId: id,
      },
    })
  }

  const handleApplyChanges = () => {
    setIsEditing(false)
    dispatch(
      changeInstanceAliasAction(
        id,
        value,
        () => {
          onAliasEdited?.(value)
        },
        () => setValue(alias),
      ),
    )
  }

  const handleCloneBack = () => {
    setIsCloneMode(false)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: {
        databaseId: id,
      },
    })
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setValue(alias)
    setIsEditing(false)
  }

  return (
    <>
      <Row responsive={false} justify="start" align="center" gap="s">
        {isCloneMode && (
          <FlexItem>
            <IconButton
              onClick={handleCloneBack}
              icon={ArrowLeftIcon}
              className={styles.iconLeftArrow}
              aria-label="back"
              data-testid="back-btn"
            />
          </FlexItem>
        )}
        <FlexItem style={{ overflow: isEditing ? 'inherit' : 'hidden' }}>
          <Row justify="between" gap="s">
            {isRediStack && (
              <FlexItem>
                <RiTooltip
                  content={
                    <RiIcon
                      type={
                        theme === Theme.Dark
                          ? 'RediStackDarkLogoIcon'
                          : 'RediStackLightLogoIcon'
                      }
                      className={styles.tooltipLogo}
                      data-testid="tooltip-redis-stack-icon"
                    />
                  }
                  position="bottom"
                >
                  <RiIcon
                    type={
                      theme === Theme.Dark
                        ? 'RediStackDarkMinIcon'
                        : 'RediStackLightMinIcon'
                    }
                    className={styles.redistackIcon}
                    data-testid="redis-stack-icon"
                  />
                </RiTooltip>
              </FlexItem>
            )}
            <FlexItem
              grow
              onClick={setEditMode}
              data-testid="edit-alias-btn"
              style={{
                overflow: isEditing ? 'inherit' : 'hidden',
                maxWidth: '360px',
              }}
            >
              {!isCloneMode && (isEditing || isLoading) ? (
                <Grid responsive className="relative">
                  <FlexItem grow={1} className="fluid">
                    <InlineItemEditor
                      onApply={handleApplyChanges}
                      onDecline={handleDeclineChanges}
                      viewChildrenMode={!isEditing}
                      isLoading={isLoading}
                      isDisabled={!value}
                      declineOnUnmount={false}
                    >
                      <EuiFieldText
                        name="alias"
                        id="alias"
                        className={cx(styles.input)}
                        placeholder="Enter Database Alias"
                        value={value}
                        fullWidth={false}
                        maxLength={500}
                        compressed
                        isLoading={isLoading}
                        onChange={onChange}
                        append={
                          !isEditing ? (
                            <RiIcon type="EditIcon" color="informative400" />
                          ) : (
                            ''
                          )
                        }
                        autoComplete="off"
                        data-testid="alias-input"
                      />
                    </InlineItemEditor>
                    <p className={styles.hiddenText}>{value}</p>
                  </FlexItem>
                </Grid>
              ) : (
                <Text
                  className={cx(styles.alias, {
                    [styles.aliasEditing]: !isCloneMode,
                  })}
                >
                  <b className={styles.aliasText} data-testid="db-alias">
                    {isCloneMode && <span>Clone {alias}</span>}
                    {!isCloneMode && (
                      <span className={cx(styles.aliasTextEditing)}>
                        {alias}
                      </span>
                    )}
                  </b>
                  <b>{getDbIndex(toNumber(database))}</b>
                  {!isCloneMode && (
                    <RiIcon
                      type="EditIcon"
                      className={cx(styles.aliasEditIcon)}
                    />
                  )}
                </Text>
              )}
            </FlexItem>
          </Row>
        </FlexItem>
      </Row>
      {!isCloneMode && (
        <Row gap="m" style={{ marginTop: 6, flexGrow: 0 }}>
          <FlexItem>
            <PrimaryButton
              size="s"
              icon={DoubleChevronRightIcon}
              aria-label="Connect to database"
              data-testid="connect-to-db-btn"
              className={styles.btnOpen}
              onClick={handleOpen}
            >
              Open
            </PrimaryButton>
          </FlexItem>
          {server?.buildType !== BuildType.RedisStack && (
            <FlexItem>
              <PrimaryButton
                size="s"
                icon={CopyIcon}
                aria-label="Clone database"
                data-testid="clone-db-btn"
                className={styles.btnClone}
                onClick={handleClone}
              >
                Clone
              </PrimaryButton>
            </FlexItem>
          )}
        </Row>
      )}
    </>
  )
}

export default DatabaseAlias
