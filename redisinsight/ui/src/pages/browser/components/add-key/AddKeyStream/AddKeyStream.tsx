import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  EuiButton,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui'
import { addStreamKey } from 'uiSrc/slices/keys'
import { isRequiredStringsValid, Maybe, validateEntryId } from 'uiSrc/utils'
import { AddStreamEntity } from 'uiSrc/pages/browser/components/key-details-add-items'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

import styles from './styles.module.scss'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const INITIAL_STREAM_FIELD_STATE = {
  fieldName: '',
  fieldValue: '',
  id: 0,
}

const AddKeyStream = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const [entryID, setEntryID] = useState<string>('*')
  const [fields, setFields] = useState<any[]>([{ ...INITIAL_STREAM_FIELD_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = isRequiredStringsValid(keyName, entryID)
      && fields.every((f) => isRequiredStringsValid(f.fieldName, f.fieldValue))
    setIsFormValid(isValid)
  }, [keyName, fields, entryID])

  const addField = () => {
    const lastField = fields[fields.length - 1]
    const newState = [
      ...fields,
      {
        ...INITIAL_STREAM_FIELD_STATE,
        id: lastField.id + 1
      }
    ]
    setFields(newState)
  }

  const removeField = (id: number) => {
    const newState = fields.filter((item) => item.id !== id)
    setFields(newState)
  }

  const clearFieldsValues = (id: number) => {
    const newState = fields.map((item) => (item.id === id
      ? {
        ...item,
        fieldName: '',
        fieldValue: ''
      } : item))
    setFields(newState)
  }

  const handleClickRemove = (id: number) => {
    if (fields.length !== 1) {
      removeField(id)
    } else {
      clearFieldsValues(id)
    }
  }

  const handleEntryIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEntryID(validateEntryId(e.target.value))
  }

  const handleFieldChange = (formField: string, id: number, value: any) => {
    const newState = fields.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value
        }
      }
      return item
    })
    setFields(newState)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: any = {
      keyName,
      entries: [{
        id: entryID,
        fields: {
          ...fields.map((item) => ({
            [item.fieldName]: item.fieldValue
          }))
        }
      }]
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStreamKey(data, onCancel))
  }

  return (
    <EuiForm className={styles.container} component="form" onSubmit={onFormSubmit}>
      <AddStreamEntity
        entryID={entryID}
        fields={fields}
        addField={addField}
        handleClickRemove={handleClickRemove}
        handleEntryIdChange={handleEntryIdChange}
        handleFieldChange={handleFieldChange}
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
