import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingContent,
  EuiPopover,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { isNull } from 'lodash'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { GroupBadge } from 'uiSrc/components'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import {
  KEY_TYPES_ACTIONS,
  KeyTypes,
  LENGTH_NAMING_BY_TYPE,
  ModulesKeyTypes,
  STREAM_ADD_ACTION,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_UNPRINTABLE_CHARACTERS,
  TEXT_DISABLED_STRING_EDITING,
} from 'uiSrc/constants'
import { AddCommonFieldsFormConfig } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { initialKeyInfo, keysSelector, selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { streamSelector } from 'uiSrc/slices/browser/stream'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  formatBytes,
  formatLongName,
  isEqualBuffers,
  isFormatEditable,
  isFullStringLoaded,
  MAX_TTL_NUMBER,
  replaceSpaces,
  stringToBuffer,
  validateTTLNumber
} from 'uiSrc/utils'
import { stringDataSelector, stringSelector } from 'uiSrc/slices/browser/string'
import KeyValueFormatter from './components/Formatter'
import AutoRefresh from '../auto-refresh'

import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  onClose: (key: RedisResponseBuffer) => void
  onRefresh: (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes) => void
  onDelete: (key: RedisResponseBuffer, type: string) => void
  onEditTTL: (key: RedisResponseBuffer, ttl: number) => void
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => void
  onAddItem?: () => void
  onEditItem?: () => void
  onRemoveItem?: () => void
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
}

const COPY_KEY_NAME_ICON = 'copyKeyNameIcon'

const PADDING_WRAPPER_SIZE = 36
const HIDE_LAST_REFRESH = 850 - PADDING_WRAPPER_SIZE
export const MIDDLE_SCREEN_RESOLUTION = 740 - PADDING_WRAPPER_SIZE

const KeyDetailsHeader = ({
  isFullScreen,
  arePanelsCollapsed,
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
  const {
    ttl: ttlProp,
    type,
    size,
    length,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { value: keyValue } = useSelector(stringDataSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { isCompressed: isStringCompressed } = useSelector(stringSelector)
  const { viewType } = useSelector(keysSelector)
  const { viewType: streamViewType } = useSelector(streamSelector)
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState(false)

  const [ttl, setTTL] = useState(`${ttlProp}`)
  const [ttlIsEditing, setTTLIsEditing] = useState(false)
  const [ttlIsHovering, setTTLIsHovering] = useState(false)

  const [key, setKey] = useState(keyProp)
  const [keyIsEditing, setKeyIsEditing] = useState(false)
  const [keyIsHovering, setKeyIsHovering] = useState(false)
  const [keyIsEditable, setKeyIsEditable] = useState(true)

  useEffect(() => {
    setKey(keyProp)
    setTTL(`${ttlProp}`)
    setKeyIsEditable(isEqualBuffers(keyBuffer, stringToBuffer(keyProp || '')))
  }, [keyProp, ttlProp, keyBuffer])

  const keyNameRef = useRef<HTMLInputElement>(null)

  const tooltipContent = formatLongName(keyProp || '')

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

    const newKeyBuffer = stringToBuffer(key || '')

    if (keyBuffer && !isEqualBuffers(keyBuffer, newKeyBuffer) && !isNull(keyProp)) {
      onEditKey(keyBuffer, newKeyBuffer, () => setKey(keyProp))
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
        source: 'keyValue',
        keyType: type
      }
    })
  }

  const handleCopy = (
    event: any,
    text = '',
    keyInputIsEditing: boolean,
    keyNameInputRef: React.RefObject<HTMLInputElement>
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
    onRefresh(keyBuffer, type)
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    const browserViewEvent = enableAutoRefresh
      ? TelemetryEvent.BROWSER_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.BROWSER_KEY_DETAILS_AUTO_REFRESH_DISABLED
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        length,
        databaseId: instanceId,
        keyType: type,
        refreshRate: +refreshRate
      }
    })
  }

  const handleChangeAutoRefreshRate = (enableAutoRefresh: boolean, refreshRate: string) => {
    if (enableAutoRefresh) {
      handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
    }
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

    if (`${ttlProp}` !== ttlValue && keyBuffer) {
      onEditTTL(keyBuffer, +ttlValue)
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

  const Actions = (width: number) => {
    const isEditable = !isStringCompressed && isFormatEditable(viewFormatProp)
    const isStringEditable = keyType === KeyTypes.String ? isFullStringLoaded(keyValue?.data?.length, length) : true
    const noEditableText = isStringCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_DISABLED_FORMATTER_EDITING
    const editToolTip = !isEditable ? noEditableText : (!isStringEditable ? TEXT_DISABLED_STRING_EDITING : null)

    return (
      <>
        {KEY_TYPES_ACTIONS[keyType] && 'addItems' in KEY_TYPES_ACTIONS[keyType] && (
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
        {keyType === KeyTypes.Stream && (
          <EuiToolTip
            content={width > MIDDLE_SCREEN_RESOLUTION ? '' : STREAM_ADD_ACTION[streamViewType].name}
            position="left"
            anchorClassName={cx(styles.actionBtn, { [styles.withText]: width > MIDDLE_SCREEN_RESOLUTION })}
          >
            <>
              {width > MIDDLE_SCREEN_RESOLUTION ? (
                <EuiButton
                  size="s"
                  iconType="plusInCircle"
                  color="secondary"
                  aria-label={STREAM_ADD_ACTION[streamViewType].name}
                  onClick={onAddItem}
                  data-testid="add-key-value-items-btn"
                >
                  {STREAM_ADD_ACTION[streamViewType].name}
                </EuiButton>
              ) : (
                <EuiButtonIcon
                  iconType="plusInCircle"
                  color="primary"
                  aria-label={STREAM_ADD_ACTION[streamViewType].name}
                  onClick={onAddItem}
                  data-testid="add-key-value-items-btn"
                />
              )}
            </>
          </EuiToolTip>
        )}
        {KEY_TYPES_ACTIONS[keyType] && 'removeItems' in KEY_TYPES_ACTIONS[keyType] && (
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
        {KEY_TYPES_ACTIONS[keyType] && 'editItem' in KEY_TYPES_ACTIONS[keyType] && (
          <div className={styles.actionBtn}>
            <EuiToolTip
              content={editToolTip}
              data-testid="edit-key-value-tooltip"
            >
              <EuiButtonIcon
                disabled={!isEditable || !isStringEditable}
                iconType="pencil"
                color="primary"
                aria-label={KEY_TYPES_ACTIONS[keyType].editItem?.name}
                onClick={onEditItem}
                data-testid="edit-key-value-btn"
              />
            </EuiToolTip>
          </div>
        )}
      </>
    )
  }

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
                  {(keyIsEditing || keyIsHovering) && (
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
                              isDisabled={!keyIsEditable}
                              disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
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
                                  { [styles.keyInputEditing]: keyIsEditing, 'input-warning': !keyIsEditable }
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
                  )}
                  <EuiText className={cx(styles.key, { [styles.hidden]: keyIsEditing || keyIsHovering })} data-testid="key-name-text">
                    <b className="truncateText">
                      {replaceSpaces(keyProp?.substring(0, 200))}
                    </b>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem />
                {!arePanelsCollapsed && (
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
                )}
                <EuiFlexItem grow={false}>
                  {(!arePanelsCollapsed || isFullScreen) && (
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
                  )}

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
                    {': '}
                    {length ?? '-'}
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
                  <>
                    {(ttlIsEditing || ttlIsHovering) && (
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
                    )}
                    <EuiText
                      grow
                      color="subdued"
                      size="s"
                      className={cx(styles.subtitleText, { [styles.hidden]: ttlIsEditing || ttlIsHovering })}
                      data-testid="key-ttl-text"
                    >
                      TTL:
                      <span className={styles.ttlTextValue}>
                        {ttl === '-1' ? 'No limit' : ttl}
                      </span>
                    </EuiText>
                  </>
                </EuiFlexItem>
                <EuiFlexItem>
                  <div className={styles.subtitleActionBtns}>
                    <AutoRefresh
                      postfix={type}
                      loading={loading}
                      lastRefreshTime={lastRefreshTime}
                      displayText={width > HIDE_LAST_REFRESH}
                      containerClassName={styles.actionBtn}
                      onRefresh={handleRefreshKey}
                      onEnableAutoRefresh={handleEnableAutoRefresh}
                      onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                      testid="refresh-key-btn"
                    />
                    {Object.values(KeyTypes).includes(keyType) && <KeyValueFormatter width={width} />}
                    {keyType && Actions(width)}

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
                            onClick={() => onDelete(keyBuffer, type)}
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
