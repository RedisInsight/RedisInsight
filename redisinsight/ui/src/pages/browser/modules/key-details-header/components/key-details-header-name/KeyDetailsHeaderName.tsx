import {
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import cx from 'classnames'
import { isNull } from 'lodash'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import {
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import { AddCommonFieldsFormConfig } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { initialKeyInfo, keysSelector, selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  formatLongName,
  isEqualBuffers,
  replaceSpaces,
  stringToBuffer,
} from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => void
}

const COPY_KEY_NAME_ICON = 'copyKeyNameIcon'

const KeyDetailsHeaderName = ({
  onEditKey,
}: Props) => {
  const { loading } = useSelector(selectedKeySelector)
  const {
    ttl: ttlProp,
    type,
    nameString: keyProp,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [key, setKey] = useState(keyProp)
  const [keyIsEditing, setKeyIsEditing] = useState(false)
  const [keyIsHovering, setKeyIsHovering] = useState(false)
  const [keyIsEditable, setKeyIsEditable] = useState(true)

  useEffect(() => {
    setKey(keyProp)
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

  const appendKeyEditing = () =>
    (!keyIsEditing ? <EuiIcon type="pencil" color="subdued" /> : '')

  return (
    <EuiFlexItem
      onMouseEnter={onMouseEnterKey}
      onMouseLeave={onMouseLeaveKey}
      onClick={onClickKey}
      grow={false}
      className={cx(
        styles.keyFlexItem, // TODO with styles.keyFlexItemEditing
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
                    value={key!}
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
                    handleCopy(event, key!, keyIsEditing, keyNameRef)}
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

  )
}

export { KeyDetailsHeaderName }
