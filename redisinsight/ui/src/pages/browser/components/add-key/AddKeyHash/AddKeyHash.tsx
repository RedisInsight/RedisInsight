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
import { Maybe } from 'uiSrc/utils'
import {
  addHashKey, addKeyStateSelector,
} from 'uiSrc/slices/keys'
import { CreateHashWithExpireDto } from 'apiSrc/modules/browser/dto/hash.dto'
import AddKeyCommonFields from 'uiSrc/pages/browser/components/add-key/AddKeyCommonFields/AddKeyCommonFields'
import {
  IHashFieldState,
  INITIAL_HASH_FIELD_STATE
} from 'uiSrc/pages/browser/components/key-details-add-items/add-hash-fields/AddHashFields'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

import styles from 'uiSrc/pages/browser/components/key-details-add-items/styles.module.scss'
import {
  AddCommonFieldsFormConfig as defaultConfig,
  AddHashFormConfig as config
} from '../constants/fields-config'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddKeyHash = (props: Props) => {
  const { loading } = useSelector(addKeyStateSelector)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)
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
      keyName,
      fields: fields.map((item) => ({
        field: item.fieldName,
        value: item.fieldValue
      }))
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addHashKey(data, props.onCancel))
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 && !(item.fieldName.length || item.fieldValue.length)

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      <AddKeyCommonFields
        config={defaultConfig}
        loading={loading}
        keyName={keyName}
        setKeyName={setKeyName}
        keyTTL={keyTTL}
        setKeyTTL={setKeyTTL}
      />
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
                anchorClassName={styles.refreshKeyTooltip}
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
                  onClick={() => props.onCancel(true)}
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
