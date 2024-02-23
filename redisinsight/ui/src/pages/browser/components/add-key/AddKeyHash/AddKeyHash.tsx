import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButton,
  EuiFieldText,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui'
import {
  addHashKey, addKeyStateSelector,
} from 'uiSrc/slices/browser/keys'

import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { IHashFieldState, INITIAL_HASH_FIELD_STATE } from 'uiSrc/pages/browser/modules/key-details/components/hash-details/add-hash-fields/AddHashFields'
import { CreateHashWithExpireDto } from 'apiSrc/modules/browser/hash/dto'
import {
  AddHashFormConfig as config
} from '../constants/fields-config'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyHash = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [fields, setFields] = useState<IHashFieldState[]>([{ ...INITIAL_HASH_FIELD_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const lastAddedFieldName = useRef<HTMLInputElement>(null)
  const prevCountFields = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(`${keyName}`.length > 0)
  }, [keyName])

  useEffect(() => {
    if (prevCountFields.current !== 0 && prevCountFields.current < fields.length) {
      lastAddedFieldName.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  const addField = () => {
    const lastField = fields[fields.length - 1]
    const newState = [
      ...fields,
      {
        ...INITIAL_HASH_FIELD_STATE,
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

  const handleFieldChange = (
    formField: string,
    id: number,
    value: any
  ) => {
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
    const data: CreateHashWithExpireDto = {
      keyName: stringToBuffer(keyName),
      fields: fields.map((item) => ({
        field: stringToBuffer(item.fieldName),
        value: stringToBuffer(item.fieldValue),
      }))
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addHashKey(data, onCancel))
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 && !(item.fieldName.length || item.fieldValue.length)

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      {
        fields.map((item, index) => (
          <EuiFlexItem
            key={item.id}
            className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
            grow
            style={{ marginBottom: '8px', marginTop: '16px' }}
          >
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem grow>
                <EuiFlexGroup gutterSize="none" alignItems="center">
                  <EuiFlexItem grow>
                    <EuiFormRow fullWidth>
                      <EuiFieldText
                        fullWidth
                        name={`fieldName-${item.id}`}
                        id={`fieldName-${item.id}`}
                        placeholder={config.fieldName.placeholder}
                        value={item.fieldName}
                        disabled={loading}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            'fieldName',
                            item.id,
                            e.target.value
                          )}
                        inputRef={index === fields.length - 1 ? lastAddedFieldName : null}
                        data-testid="field-name"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow>
                    <EuiFormRow fullWidth>
                      <EuiFieldText
                        fullWidth
                        name={`fieldValue-${item.id}`}
                        id={`fieldValue-${item.id}`}
                        placeholder={config.fieldValue.placeholder}
                        value={item.fieldValue}
                        disabled={loading}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            'fieldValue',
                            item.id,
                            e.target.value
                          )}
                        data-testid="field-value"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <AddItemsActions
                id={item.id}
                index={index}
                length={fields.length}
                addItem={addField}
                removeItem={removeField}
                clearItemValues={clearFieldsValues}
                clearIsDisabled={isClearDisabled(item)}
                loading={loading}
              />
            </EuiFlexGroup>
          </EuiFlexItem>
        ))
      }

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
                  isLoading={loading}
                  onClick={submitData}
                  disabled={!isFormValid || loading}
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

export default AddKeyHash
