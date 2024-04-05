import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTextColor } from '@elastic/eui'
import cx from 'classnames'
import { toNumber } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { entryIdRegex, stringToBuffer } from 'uiSrc/utils'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { addNewEntriesAction, streamDataSelector } from 'uiSrc/slices/browser/stream'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { INITIAL_STREAM_FIELD_STATE } from 'uiSrc/pages/browser/components/add-key/AddKeyStream/AddKeyStream'
import { KeyTypes } from 'uiSrc/constants'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AddStreamEntriesDto } from 'apiSrc/modules/browser/stream/dto'

import StreamEntryFields from './StreamEntryFields/StreamEntryFields'
import styles from './styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddStreamEntries = (props: Props) => {
  const { closePanel } = props
  const { lastGeneratedId } = useSelector(streamDataSelector)
  const { name: keyName = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const [entryID, setEntryID] = useState<string>('*')
  const [entryIdError, setEntryIdError] = useState('')
  const [fields, setFields] = useState<any[]>([{ ...INITIAL_STREAM_FIELD_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = !entryIdError
    setIsFormValid(isValid)
  }, [fields, entryIdError])

  useEffect(() => {
    validateEntryID()
  }, [entryID])

  const validateEntryID = () => {
    if (!entryIdRegex.test(entryID)) {
      setEntryIdError(`${config.entryId.name} format is incorrect`)
      return
    }

    if (!lastGeneratedId) {
      setEntryIdError('')
      return
    }

    if (entryID === '*') {
      setEntryIdError('')
      return
    }

    const [lastIdTimestamp, lastId] = lastGeneratedId.split('-')
    const [idTimestamp, id] = entryID?.split('-')

    if (toNumber(idTimestamp) > toNumber(lastIdTimestamp)) {
      setEntryIdError('')
      return
    }

    if (toNumber(lastIdTimestamp) === toNumber(idTimestamp) && (id === '*' || toNumber(id) > toNumber(lastId))) {
      setEntryIdError('')
      return
    }
    setEntryIdError('Must be greater than the last ID')
  }

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Stream,
        numberOfAdded: fields.length,
      }
    })
  }

  const submitData = (): void => {
    if (isFormValid) {
      const data: AddStreamEntriesDto = {
        keyName,
        entries: [{
          id: entryID,
          fields: [...fields.map(({ name, value }) => ({ name: stringToBuffer(name), value: stringToBuffer(value) }))],
        }]
      }
      dispatch(addNewEntriesAction(data, onSuccessAdded))
    }
  }

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        data-test-subj="add-stream-field-panel"
        className={cx(styles.content, 'eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        <StreamEntryFields
          compressed
          entryIdError={entryIdError}
          entryID={entryID}
          setEntryID={setEntryID}
          fields={fields}
          setFields={setFields}
        />
      </EuiPanel>
      <EuiPanel
        style={{ border: 'none' }}
        color="transparent"
        hasShadow={false}
        className="flexItemNoFullWidth"
      >
        <EuiFlexGroup justifyContent="flexEnd" gutterSize="l">
          <EuiFlexItem grow={false}>
            <div>
              <EuiButton color="secondary" onClick={() => closePanel(true)} data-testid="cancel-members-btn">
                <EuiTextColor color="default">Cancel</EuiTextColor>
              </EuiButton>
            </div>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div>
              <EuiButton
                fill
                size="m"
                color="secondary"
                onClick={submitData}
                disabled={!isFormValid}
                data-testid="save-elements-btn"
              >
                Save
              </EuiButton>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export default AddStreamEntries
