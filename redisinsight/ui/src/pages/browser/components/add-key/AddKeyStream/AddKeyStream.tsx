import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  EuiButton,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui'
import { addStreamKey } from 'uiSrc/slices/browser/keys'
import { entryIdRegex, isRequiredStringsValid, Maybe, stringToBuffer } from 'uiSrc/utils'
import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { StreamEntryFields } from 'uiSrc/pages/browser/modules/key-details/components/stream-details/add-stream-entity'
import { CreateStreamDto } from 'apiSrc/modules/browser/stream/dto'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

import styles from './styles.module.scss'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

export const INITIAL_STREAM_FIELD_STATE = {
  name: '',
  value: '',
  id: 0,
}

const AddKeyStream = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props

  const [entryIdError, setEntryIdError] = useState('')
  const [entryID, setEntryID] = useState<string>('*')
  const [fields, setFields] = useState<any[]>([{ ...INITIAL_STREAM_FIELD_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = isRequiredStringsValid(keyName) && !entryIdError
    setIsFormValid(isValid)
  }, [keyName, fields, entryIdError])

  useEffect(() => {
    validateEntryID()
  }, [entryID])

  const validateEntryID = () => {
    setEntryIdError(entryIdRegex.test(entryID) ? '' : `${config.entryId.name} format is incorrect`)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateStreamDto = {
      keyName: stringToBuffer(keyName),
      entries: [{
        id: entryID,
        fields: [...fields.map(({ name, value }) => ({ name: stringToBuffer(name), value: stringToBuffer(value) }))],
      }]
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStreamKey(data, onCancel))
  }

  return (
    <EuiForm className={styles.container} component="form" onSubmit={onFormSubmit}>
      <StreamEntryFields
        entryID={entryID}
        entryIdError={entryIdError}
        fields={fields}
        setFields={setFields}
        setEntryID={setEntryID}
      />
      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel
          color="transparent"
          className="flexItemNoFullWidth"
          hasShadow={false}
          borderRadius="none"
          style={{ border: 'none' }}
        >
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  color="secondary"
                  onClick={() => onCancel(true)}
                  className="btn-cancel btn-back"
                >
                  <EuiTextColor>Cancel</EuiTextColor>
                </EuiButton>
              </div>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  fill
                  size="m"
                  color="secondary"
                  className="btn-add"
                  onClick={submitData}
                  disabled={!isFormValid}
                  data-testid="add-key-hash-btn"
                >
                  Add Key
                </EuiButton>
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </AddKeyFooter>
    </EuiForm>
  )
}

export default AddKeyStream
