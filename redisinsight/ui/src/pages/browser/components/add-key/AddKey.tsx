import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyTypes } from 'uiSrc/constants'
import HelpTexts from 'uiSrc/constants/help-texts'
import AddKeyCommonFields from 'uiSrc/pages/browser/components/add-key/AddKeyCommonFields/AddKeyCommonFields'
import { addKeyStateSelector, resetAddKey, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { isContainJSONModule, Maybe, stringToBuffer } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
import AddKeyHash from './AddKeyHash/AddKeyHash'
import AddKeyZset from './AddKeyZset/AddKeyZset'
import AddKeyString from './AddKeyString/AddKeyString'
import AddKeySet from './AddKeySet/AddKeySet'
import AddKeyList from './AddKeyList/AddKeyList'
import AddKeyReJSON from './AddKeyReJSON/AddKeyReJSON'
import AddKeyStream from './AddKeyStream/AddKeyStream'

import styles from './styles.module.scss'

export interface Props {
  onAddKeyPanel: (value: boolean, keyName?: RedisResponseBuffer) => void
  onClosePanel: () => void
  arePanelsCollapsed?: boolean
}
const AddKey = (props: Props) => {
  const { onAddKeyPanel, onClosePanel, arePanelsCollapsed } = props
  const dispatch = useDispatch()

  const { loading } = useSelector(addKeyStateSelector)
  const { id: instanceId, modules = [] } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  useEffect(() =>
    // componentWillUnmount
    () => {
      dispatch(resetAddKey())
    },
  [])

  const options = ADD_KEY_TYPE_OPTIONS.map((item) => {
    const { value, color, text } = item
    return {
      value,
      inputDisplay: (
        <EuiHealth color={color} style={{ lineHeight: 'inherit' }} data-test-subj={value}>
          {text}
        </EuiHealth>
      ),
    }
  })
  const [typeSelected, setTypeSelected] = useState<string>(options[0].value)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)

  const onChangeType = (value: string) => {
    setTypeSelected(value)
  }

  const closeKeyTelemetry = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_CANCELLED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_CANCELLED
      ),
      eventData: {
        databaseId: instanceId
      }
    })
  }

  const closeKey = () => {
    onClosePanel()
    closeKeyTelemetry()
  }

  const closeAddKeyPanel = (isCancelled?: boolean) => {
    onAddKeyPanel(false, stringToBuffer(keyName))
    if (isCancelled) {
      onClosePanel()
      closeKeyTelemetry()
    }
  }

  const defaultFields = {
    keyName,
    keyTTL
  }

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        justifyContent="center"
        className={cx(styles.contentWrapper, 'relative')}
        gutterSize="none"
      >
        <EuiFlexGroup
          gutterSize="none"
          direction="column"
          justifyContent="center"
          responsive={false}
          className={styles.content}
        >
          <EuiFlexItem grow style={{ marginBottom: '36px' }}>
            <EuiTitle size="xs">
              <h4>New Key</h4>
            </EuiTitle>
            {!arePanelsCollapsed && (
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
                  onClick={() => closeKey()}
                />
              </EuiToolTip>
            )}
          </EuiFlexItem>
          <div className="eui-yScroll">
            <div className={styles.contentFields}>
              <AddKeyCommonFields
                typeSelected={typeSelected}
                onChangeType={onChangeType}
                options={options}
                loading={loading}
                keyName={keyName}
                setKeyName={setKeyName}
                keyTTL={keyTTL}
                setKeyTTL={setKeyTTL}
              />

              <Divider colorVariable="separatorColor" className={styles.divider} />

              {typeSelected === KeyTypes.Hash && (
                <AddKeyHash onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.ZSet && (
                <AddKeyZset onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.Set && (
                <AddKeySet onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.String && (
                <AddKeyString onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.List && (
                <AddKeyList onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
              {typeSelected === KeyTypes.ReJSON && (
                <>
                  {!isContainJSONModule(modules) && (
                    <span className={styles.helpText} data-testid="json-not-loaded-text">
                      {HelpTexts.REJSON_SHOULD_BE_LOADED}
                    </span>
                  )}
                  <AddKeyReJSON onCancel={closeAddKeyPanel} {...defaultFields} />
                </>
              )}
              {typeSelected === KeyTypes.Stream && (
                <AddKeyStream onCancel={closeAddKeyPanel} {...defaultFields} />
              )}
            </div>
          </div>
        </EuiFlexGroup>
        <div id="formFooterBar" className="formFooterBar" />
      </EuiFlexGroup>
    </div>
  )
}

export default AddKey
