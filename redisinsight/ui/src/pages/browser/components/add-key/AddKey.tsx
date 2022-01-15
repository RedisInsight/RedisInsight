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
import { DataTypes } from 'uiSrc/constants'
import HelpTexts from 'uiSrc/constants/help-texts'
import { addKeyStateSelector, resetAddKey } from 'uiSrc/slices/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ADD_DATA_TYPE_OPTIONS } from './constants/data-type-options'
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

  useEffect(() =>
    // componentWillUnmount
    () => {
      dispatch(resetAddKey())
    },
  [])

  const options = ADD_DATA_TYPE_OPTIONS.map((item) => {
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
      event: TelemetryEvent.BROWSER_KEY_ADD_CANCELLED,
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
              legend={{ children: 'Select data type', display: 'hidden' }}
              style={{ marginBottom: '16px' }}
            >
              <EuiFormRow
                label="Data Type*"
                helpText={
                  typeSelected === DataTypes.ReJSON
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
            {typeSelected === DataTypes.Hash && (
              <AddKeyHash onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === DataTypes.ZSet && (
              <AddKeyZset onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === DataTypes.Set && (
              <AddKeySet onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === DataTypes.String && (
              <AddKeyString onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === DataTypes.List && (
              <AddKeyList onCancel={closeAddKeyPanel} />
            )}
            {typeSelected === DataTypes.ReJSON && (
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
