import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSuperSelect,
  EuiHealth,
  EuiTitle,
  EuiFormFieldset,
  EuiFormRow,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui'
import { KeyTypes } from 'uiSrc/constants'
import HelpTexts from 'uiSrc/constants/help-texts'
import { addKeyStateSelector, resetAddKey, keysSelector } from 'uiSrc/slices/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sendEventTelemetry, TelemetryEvent, getBasedOnViewTypeEvent } from 'uiSrc/telemetry'
import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
import AddKeyHash from './AddKeyHash/AddKeyHash'
import AddKeyZset from './AddKeyZset/AddKeyZset'
import AddKeyString from './AddKeyString/AddKeyString'
import AddKeySet from './AddKeySet/AddKeySet'
import AddKeyList from './AddKeyList/AddKeyList'
import AddKeyReJSON from './AddKeyReJSON/AddKeyReJSON'

import styles from './styles.module.scss'

export interface Props {
  handleAddKeyPanel: (value: boolean) => void;
  handleCloseKey: () => void;
}
const AddKey = (props: Props) => {
  const { handleAddKeyPanel, handleCloseKey } = props
  const dispatch = useDispatch()

  const { loading } = useSelector(addKeyStateSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
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
    handleCloseKey()
    closeKeyTelemetry()
  }

  const closeAddKeyPanel = (isCancelled?: boolean) => {
    handleAddKeyPanel(false)
    if (isCancelled) {
      closeKeyTelemetry()
    }
  }

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        justifyContent="center"
        className={cx(styles.contentWrapper, 'relative')}
        gutterSize="none"
      >
        <div className={cx(styles.content, 'eui-yScroll')}>
          <EuiFlexGroup
            gutterSize="none"
            direction="column"
            justifyContent="center"
          >
            <EuiFlexItem grow style={{ marginBottom: '36px' }}>
              <EuiTitle size="s">
                <h4>
                  <b>Add key</b>
                </h4>
              </EuiTitle>
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
            </EuiFlexItem>
            <EuiFormFieldset
              legend={{ children: 'Select key type', display: 'hidden' }}
              style={{ marginBottom: '16px' }}
            >
              <EuiFormRow
                label="Key Type*"
                helpText={
                  typeSelected === KeyTypes.ReJSON
                    ? (
                      <span style={{ color: '#b5b6c0' }}>
                        {HelpTexts.REJSON_SHOULD_BE_LOADED}
                      </span>
                    )
                    : null
                }
                fullWidth
              >
                <EuiSuperSelect
                  itemClassName="withColorDefinition"
                  fullWidth
                  disabled={loading}
                  options={options}
                  valueOfSelected={typeSelected}
                  onChange={(value: string) => onChangeType(value)}
                />
              </EuiFormRow>
            </EuiFormFieldset>
            {typeSelected === KeyTypes.Hash && (
              <AddKeyHash onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === KeyTypes.ZSet && (
              <AddKeyZset onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === KeyTypes.Set && (
              <AddKeySet onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === KeyTypes.String && (
              <AddKeyString onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === KeyTypes.List && (
              <AddKeyList onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === KeyTypes.ReJSON && (
              <AddKeyReJSON onCancel={closeAddKeyPanel} />
            )}
          </EuiFlexGroup>
        </div>
        <div id="formFooterBar" className="formFooterBar" />
      </EuiFlexGroup>
    </div>
  )
}

export default AddKey
