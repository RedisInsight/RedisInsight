import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTextColor } from '@elastic/eui'
import cx from 'classnames'
import { keyBy, mapValues, toNumber } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { entryIdRegex, isRequiredStringsValid } from 'uiSrc/utils'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { addNewEntriesAction, streamDataSelector } from 'uiSrc/slices/browser/stream'

import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { INITIAL_STREAM_FIELD_STATE } from 'uiSrc/pages/browser/components/add-key/AddKeyStream/AddKeyStream'
import { StreamEntryFields } from 'uiSrc/pages/browser/components/key-details-add-items'
import { AddStreamEntriesDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

export interface Props {
  onCancel: (isCancelled?: boolean) => void
}

const AddStreamEntries = (props: Props) => {
  const { onCancel } = props
  const { lastEntry } = useSelector(streamDataSelector)
  const { name: keyName = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }

  const [entryID, setEntryID] = useState<string>('*')
  const [entryIdError, setEntryIdError] = useState('')
  const [fields, setFields] = useState<any[]>([{ ...INITIAL_STREAM_FIELD_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = !entryIdError && fields.every((f) => isRequiredStringsValid(f.fieldName, f.fieldValue))
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

    if (!lastEntry.id) return

    if (entryID === '*') {
      setEntryIdError('')
      return
    }

    const [lastIdTimestamp, lastId] = lastEntry.id?.split('-')
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

  const submitData = (): void => {
    if (isFormValid) {
      const data: AddStreamEntriesDto = {
        keyName,
        entries: [{
          id: entryID,
          fields: mapValues(keyBy(fields, 'fieldName'), 'fieldValue')
        }]
      }
      dispatch(addNewEntriesAction(data, onCancel))
    }
  }

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
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
              <EuiButton color="secondary" onClick={() => onCancel(true)} data-testid="cancel-members-btn">
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
