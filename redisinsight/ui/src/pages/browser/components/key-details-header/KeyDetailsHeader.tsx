import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPopover,
  EuiText,
  EuiToolTip,
  EuiLoadingContent,
  EuiTextColor,
} from '@elastic/eui'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { formatDistanceToNow } from 'date-fns'
import AutoSizer from 'react-virtualized-auto-sizer'

import { GroupBadge } from 'uiSrc/components'
import { KeyTypes, KEY_TYPES_ACTIONS, LENGTH_NAMING_BY_TYPE, ModulesKeyTypes } from 'uiSrc/constants'
import { selectedKeyDataSelector, selectedKeySelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { formatBytes, formatNameShort, MAX_TTL_NUMBER, replaceSpaces, validateTTLNumber } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { AddCommonFieldsFormConfig } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  onClose: (key: string) => void
  onRefresh: (key: string, type: KeyTypes) => void
  onDelete: (key: string, type: string) => void
  onEditTTL: (key: string, ttl: number) => void
  onEditKey: (key: string, newKey: string, onFailure?: () => void) => void
  onAddItem?: () => void
  onEditItem?: () => void
  onRemoveItem?: () => void
  isFullScreen: boolean
  onToggleFullScreen: () => void
}

const COPY_KEY_NAME_ICON = 'copyKeyNameIcon'
const initialKeyInfo = {
  ttl: -1,
  name: '',
  type: KeyTypes.String,
  size: 1,
  length: 0,
}

const PADDING_WRAPPER_SIZE = 36
const HIDE_LAST_REFRESH = 860 - PADDING_WRAPPER_SIZE
const MIDDLE_SCREEN_RESOLUTION = 640 - PADDING_WRAPPER_SIZE

const KeyDetailsHeader = ({
  isFullScreen,
  onToggleFullScreen = () => {},
  onRefresh,
  onClose,
  onDelete,
  onEditTTL,
  onEditKey,
  keyType,
  onAddItem = () => {},
  onEditItem = () => {},
  onRemoveItem = () => {},
}: Props) => {
  const { loading, lastRefreshTime } = useSelector(selectedKeySelector)
  const { ttl: ttlProp, name: keyProp = '', type, size, length } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState(false)
  const [lastRefreshMessage, setLastRefreshMessage] = useState('')

  const [ttl, setTTL] = useState(`${ttlProp}`)
  const [ttlIsEditing, setTTLIsEditing] = useState(false)
  const [ttlIsHovering, setTTLIsHovering] = useState(false)

  const [key, setKey] = useState(keyProp)
  const [keyIsEditing, setKeyIsEditing] = useState(false)
  const [keyIsHovering, setKeyIsHovering] = useState(false)

  useEffect(() => {
    setKey(keyProp)
    setTTL(`${ttlProp}`)
  }, [keyProp, ttlProp])

  useEffect(() => {
    updateLastRefresh()
  }, [lastRefreshTime])

  const keyNameRef = useRef(null)

  const tooltipContent = formatNameShort(keyProp)

  const onMouseEnterKey = () => {
    setKeyIsHovering(true)
  }

  const onMouseLeaveKey = () => {
    setKeyIsHovering(false)
  }

  const onClickKey = () => {
    setKeyIsEditing(true)
  }

  const onChangeKey = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
    keyIsEditing && setKey(value)
  }

  const applyEditKey = () => {
    setKeyIsEditing(false)
    setKeyIsHovering(false)

    if (keyProp !== key) {
      onEditKey(keyProp, key, () => setKey(keyProp))
    }
  }

  const cancelEditKey = (event?: React.MouseEvent<HTMLElement>) => {
    const { id } = event?.target as HTMLElement || {}
    if (id === COPY_KEY_NAME_ICON) {
      return
    }
    setKey(keyProp)
    setKeyIsEditing(false)
    setKeyIsHovering(false)

    event?.stopPropagation()
  }

  const closePopoverDelete = () => {
    setIsPopoverDeleteOpen(false)
  }

  const showPopoverDelete = () => {
    setIsPopoverDeleteOpen((isPopoverDeleteOpen) => !isPopoverDeleteOpen)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_DELETE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: type
      }
    })
  }

  const handleCopy = (
    event: any,
    text = '',
    keyInputIsEditing: boolean,
    keyNameInputRef: React.MutableRefObject<null>
  ) => {
    navigator.clipboard.writeText(text)

    if (keyInputIsEditing) {
      keyNameInputRef?.current?.focus()
    }

    event.stopPropagation()

    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_COPIED,
        TelemetryEvent.TREE_VIEW_KEY_COPIED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: type
      }
    })
  }

  const handleRefreshKey = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_DETAILS_REFRESH_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_DETAILS_REFRESH_CLICKED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: type
      }
    })
    onRefresh(key, type)
  }

  const onMouseEnterTTL = () => {
    setTTLIsHovering(true)
  }

  const onMouseLeaveTTL = () => {
    setTTLIsHovering(false)
  }

  const onClickTTL = () => {
    setTTLIsEditing(true)
  }

  const onChangeTtl = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
    ttlIsEditing && setTTL(validateTTLNumber(value) || '-1')
  }

  const applyEditTTL = () => {
    const ttlValue = ttl || '-1'

    setTTLIsEditing(false)
    setTTLIsHovering(false)

    if (`${ttlProp}` !== ttlValue) {
      onEditTTL(keyProp, +ttlValue)
    }
  }

  const cancelEditTTl = (event: any) => {
    setTTL(`${ttlProp}`)
    setTTLIsEditing(false)
    setTTLIsHovering(false)

    event?.stopPropagation()
  }

  const appendKeyEditing = () =>
    (!keyIsEditing ? <EuiIcon type="pencil" color="subdued" /> : '')

  const appendTTLEditing = () =>
    (!ttlIsEditing ? <EuiIcon type="pencil" color="subdued" /> : '')

  const updateLastRefresh = () => {
    setLastRefreshMessage(
      lastRefreshTime
        ? `${formatDistanceToNow(lastRefreshTime, { addSuffix: true })}`
        : 'Refresh'
    )
  }

  const KeySize = (width: number) => (
    <EuiFlexItem grow={false}>
      <EuiText
        grow
        color="subdued"
        size="s"
        className={styles.subtitleText}
        data-testid="key-size-text"
      >
        <EuiToolTip
          title="Key Size"
          className={styles.tooltip}
          position="left"
          content={(
            <>
              {formatBytes(size, 3)}
            </>
          )}
        >
          <>
            {width > MIDDLE_SCREEN_RESOLUTION && 'Key Size: '}
            {formatBytes(size, 0)}
          </>
        </EuiToolTip>
      </EuiText>
    </EuiFlexItem>
  )

  const Actions = (width: number) => (
    <>
      {'addItems' in KEY_TYPES_ACTIONS[keyType] && (
        <EuiToolTip
          content={width > MIDDLE_SCREEN_RESOLUTION ? '' : KEY_TYPES_ACTIONS[keyType].addItems?.name}
          position="left"
          anchorClassName={cx(styles.actionBtn, { [styles.withText]: width > MIDDLE_SCREEN_RESOLUTION })}
        >
          <>
            {width > MIDDLE_SCREEN_RESOLUTION ? (
              <EuiButton
                size="s"
                iconType="plusInCircle"
                color="secondary"
                aria-label={KEY_TYPES_ACTIONS[keyType].addItems?.name}
                onClick={onAddItem}
                data-testid="add-key-value-items-btn"
              >
                {KEY_TYPES_ACTIONS[keyType].addItems?.name}
              </EuiButton>
            ) : (
              <EuiButtonIcon
                iconType="plusInCircle"
                color="primary"
                aria-label={KEY_TYPES_ACTIONS[keyType].addItems?.name}
                onClick={onAddItem}
                data-testid="add-key-value-items-btn"
              />
            )}
          </>
        </EuiToolTip>
      )}
      {'removeItems' in KEY_TYPES_ACTIONS[keyType] && (
        <EuiToolTip
          content={KEY_TYPES_ACTIONS[keyType].removeItems?.name}
          position="left"
          anchorClassName={styles.actionBtn}
        >
          <EuiButtonIcon
            iconType="minusInCircle"
            color="primary"
            aria-label={KEY_TYPES_ACTIONS[keyType].removeItems?.name}
            onClick={onRemoveItem}
            data-testid="remove-key-value-items-btn"
          />
        </EuiToolTip>
      )}
      {'editItem' in KEY_TYPES_ACTIONS[keyType] && (
        <div className={styles.actionBtn}>
          <EuiButtonIcon
            iconType="pencil"
            color="primary"
            aria-label={KEY_TYPES_ACTIONS[keyType].editItem?.name}
            onClick={onEditItem}
            data-testid="edit-key-value-btn"
          />
        </div>
      )}
    </>
  )

  return (
    <div className={`key-details-header ${styles.container}`} data-testid="key-details-header">
      {loading ? (
        <div>
          <EuiLoadingContent lines={2} />
        </div>
      ) : (
        <AutoSizer disableHeight>
          {({ width }) => (
            <div style={{ width }}>
              <EuiFlexGroup
                responsive={false}
                gutterSize="s"
                alignItems="center"
                className={styles.keyFlexGroup}
              >
                <EuiFlexItem className={styles.keyType} grow={false}>
                  <GroupBadge type={type} />
                </EuiFlexItem>
                <EuiFlexItem
                  onMouseEnter={onMouseEnterKey}
                  onMouseLeave={onMouseLeaveKey}
                  onClick={onClickKey}
                  grow={false}
                  className={cx(
                    styles.keyFlexItem,
                    keyIsEditing || keyIsHovering ? styles.keyFlexItemEditing : null,
                  )}
                  data-testid="edit-key-btn"
                >
                  {keyIsEditing || keyIsHovering ? (
                    <EuiFlexGrid
                      columns={1}
                      responsive={false}
                      gutterSize="none"
                      className={styles.classNameGridComponent}
                    >
                      <EuiFlexItem
                        grow
                        component="span"
                        className={styles.flexItemKeyInput}
                      >
                        <EuiToolTip
                          title="Key Name"
                          className={styles.tooltip}
                          position="left"
                          content={tooltipContent}
                          anchorClassName={styles.toolTipAnchorKey}
                        >
                          <>
                            <InlineItemEditor
                              onApply={() => applyEditKey()}
                              onDecline={(event) => cancelEditKey(event)}
                              viewChildrenMode={!keyIsEditing}
                              isLoading={loading}
                              declineOnUnmount={false}
                            >
                              <EuiFieldText
                                name="key"
                                id="key"
                                inputRef={keyNameRef}
                                className={cx(
                                  styles.keyInput,
                                  { [styles.keyInputEditing]: keyIsEditing }
                                )}
                                placeholder={AddCommonFieldsFormConfig?.keyName?.placeholder}
                                value={key}
                                fullWidth={false}
                                compressed
                                isLoading={loading}
                                onChange={onChangeKey}
                                append={appendKeyEditing()}
                                readOnly={!keyIsEditing}
                                autoComplete="off"
                                data-testid="edit-key-input"
                              />
                            </InlineItemEditor>
                            <p className={styles.keyHiddenText}>{key}</p>
                          </>
                        </EuiToolTip>
                        {keyIsHovering && (
                          <EuiToolTip
                            position="right"
                            content="Copy"
                            anchorClassName={styles.copyKey}
                          >
                            <EuiButtonIcon
                              iconType="copy"
                              id={COPY_KEY_NAME_ICON}
                              aria-label="Copy key name"
                              color="primary"
                              onClick={(event: any) =>
                                handleCopy(event, key, keyIsEditing, keyNameRef)}
                              data-testid="copy-key-name-btn"
                            />
                          </EuiToolTip>
                        )}
                      </EuiFlexItem>
                    </EuiFlexGrid>
                  ) : (
                    <EuiText className={styles.key} data-testid="key-name-text">
                      <b className="truncateText">
                        {replaceSpaces(keyProp.substring(0, 200))}
                      </b>
                    </EuiText>
                  )}
                </EuiFlexItem>
                <EuiFlexItem />
                <EuiFlexItem grow={false} style={{ marginRight: '8px' }}>
                  <EuiToolTip
                    content={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                    position="left"
                    anchorClassName={styles.exitFullScreenBtn}
                  >
                    <EuiButtonIcon
                      iconType={isFullScreen ? 'fullScreenExit' : 'fullScreen'}
                      color="primary"
                      aria-label="Open full screen"
                      onClick={onToggleFullScreen}
                      data-testid="toggle-full-screen"
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiToolTip
                    content="Close"
                    position="left"
                    anchorClassName={styles.closeKeyTooltip}
                  >
                    <EuiButtonIcon
                      iconType="cross"
                      color="primary"
                      aria-label="Close key"
                      className={styles.closeBtn}
                      onClick={() => onClose(keyProp)}
                      data-testid="close-key-btn"
                    />
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup
                responsive={false}
                justifyContent="center"
                alignItems="center"
                className={styles.groupSecondLine}
                gutterSize="m"
              >
                {size && KeySize(width)}
                <EuiFlexItem grow={false}>
                  <EuiText
                    grow
                    color="subdued"
                    size="s"
                    className={`${styles.subtitleText}`}
                    data-testid="key-length-text"
                  >
                    {LENGTH_NAMING_BY_TYPE[type] ?? 'Length'}
                    {' '}
                    (
                    {length ?? '-'}
                    )
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem
                  onMouseEnter={onMouseEnterTTL}
                  onMouseLeave={onMouseLeaveTTL}
                  onClick={onClickTTL}
                  grow={false}
                  className={styles.flexItemTTL}
                  data-testid="edit-ttl-btn"
                >
                  {ttlIsEditing || ttlIsHovering ? (
                    <EuiFlexGrid
                      columns={2}
                      responsive={false}
                      gutterSize="none"
                      className={styles.ttlGridComponent}
                    >
                      <EuiFlexItem grow={false}>
                        <EuiText
                          grow
                          color="subdued"
                          size="s"
                          className={styles.subtitleText}
                        >
                          TTL:
                        </EuiText>
                      </EuiFlexItem>
                      <EuiFlexItem grow component="span">
                        <InlineItemEditor
                          onApply={() => applyEditTTL()}
                          onDecline={(event) => cancelEditTTl(event)}
                          viewChildrenMode={!ttlIsEditing}
                          isLoading={loading}
                          declineOnUnmount={false}
                        >
                          <EuiFieldText
                            name="ttl"
                            id="ttl"
                            className={cx(
                              styles.ttlInput,
                              ttlIsEditing && styles.editing,
                            )}
                            maxLength={200}
                            placeholder="No limit"
                            value={ttl === '-1' ? '' : ttl}
                            fullWidth={false}
                            compressed
                            min={0}
                            max={MAX_TTL_NUMBER}
                            isLoading={loading}
                            onChange={onChangeTtl}
                            append={appendTTLEditing()}
                            autoComplete="off"
                            data-testid="edit-ttl-input"
                          />
                        </InlineItemEditor>
                      </EuiFlexItem>
                    </EuiFlexGrid>
                  ) : (
                    <EuiText
                      grow
                      color="subdued"
                      size="s"
                      className={styles.subtitleText}
                      data-testid="key-ttl-text"
                    >
                      TTL:
                      <span className={styles.ttlTextValue}>
                        {ttl === '-1' ? 'No limit' : ttl}
                      </span>
                    </EuiText>
                  )}
                </EuiFlexItem>
                <EuiFlexItem>
                  <div className={styles.subtitleActionBtns}>
                    {width > HIDE_LAST_REFRESH && (
                      <EuiTextColor className={styles.refreshSummary}>
                        Last refresh:
                        <span className={styles.refreshTime}>
                          {` ${lastRefreshMessage}`}
                        </span>
                      </EuiTextColor>
                    )}
                    <EuiToolTip
                      title="Last Refresh"
                      content={lastRefreshMessage}
                      position="left"
                      anchorClassName={styles.actionBtn}
                    >
                      <EuiButtonIcon
                        iconType="refresh"
                        color="primary"
                        aria-label="Refresh key"
                        onClick={handleRefreshKey}
                        onMouseEnter={updateLastRefresh}
                        data-testid="refresh-key-btn"
                      />
                    </EuiToolTip>
                    {(keyType && KEY_TYPES_ACTIONS[keyType]) && Actions(width)}

                    <EuiPopover
                      key={keyProp}
                      anchorPosition="leftCenter"
                      ownFocus
                      isOpen={isPopoverDeleteOpen}
                      closePopover={closePopoverDelete}
                      panelPaddingSize="l"
                      anchorClassName={styles.deleteKeyPopover}
                      button={(
                        <EuiButtonIcon
                          iconType="trash"
                          color="primary"
                          aria-label="Delete Key"
                          className="deleteKeyBtn"
                          onClick={showPopoverDelete}
                          data-testid="delete-key-btn"
                        />
                      )}
                    >
                      <div className={styles.popoverDeleteContainer}>
                        <EuiText size="m">
                          <h4 style={{ wordBreak: 'break-all' }}>
                            <b>{tooltipContent}</b>
                          </h4>
                          <EuiText size="s">
                            will be deleted.
                          </EuiText>
                        </EuiText>
                        <div className={styles.popoverFooter}>
                          <EuiButton
                            fill
                            size="s"
                            color="warning"
                            iconType="trash"
                            onClick={() => onDelete(keyProp, type)}
                            className={styles.popoverDeleteBtn}
                            data-testid="delete-key-confirm-btn"
                          >
                            Delete
                          </EuiButton>
                        </div>
                      </div>
                    </EuiPopover>
                  </div>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          )}
        </AutoSizer>
      )}
    </div>
  )
}

export default KeyDetailsHeader
