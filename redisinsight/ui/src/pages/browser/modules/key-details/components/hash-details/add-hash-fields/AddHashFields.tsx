import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiFieldText } from '@elastic/eui'
import { toNumber } from 'lodash'
import {
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  addHashFieldsAction,
  resetUpdateValue,
  updateHashValueStateSelector,
} from 'uiSrc/slices/browser/hash'
import { KeyTypes } from 'uiSrc/constants'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'

import { stringToBuffer, validateTTLNumberForAddKey } from 'uiSrc/utils'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import {
  IHashFieldState,
  INITIAL_HASH_FIELD_STATE,
} from 'uiSrc/pages/browser/components/add-key/AddKeyHash/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { AddFieldsToHashDto, HashFieldDto } from 'uiSrc/api-client'

import styles from './styles.module.scss'

export interface Props {
  isExpireFieldsAvailable?: boolean
  closePanel: (isCancelled?: boolean) => void
}

const AddHashFields = (props: Props) => {
  const { isExpireFieldsAvailable, closePanel } = props
  const dispatch = useDispatch()
  const [fields, setFields] = useState<IHashFieldState[]>([
    { ...INITIAL_HASH_FIELD_STATE },
  ])
  const { loading } = useSelector(updateHashValueStateSelector)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const lastAddedFieldName = useRef<HTMLInputElement>(null)

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        dispatch(resetUpdateValue())
      },
    [],
  )

  useEffect(() => {
    lastAddedFieldName.current?.focus()
  }, [fields.length])

  const addField = () => {
    const lastField = fields[fields.length - 1]
    const newState = [
      ...fields,
      {
        ...INITIAL_HASH_FIELD_STATE,
        id: lastField.id + 1,
      },
    ]
    setFields(newState)
  }

  const removeField = (id: number) => {
    const newState = fields.filter((item) => item.id !== id)
    setFields(newState)
  }

  const clearFieldsValues = (id: number) => {
    const newState = fields.map((item) =>
      item.id === id
        ? {
            ...item,
            fieldName: '',
            fieldValue: '',
            fieldTTL: undefined,
          }
        : item,
    )
    setFields(newState)
  }

  const onClickRemove = ({ id }: IHashFieldState) => {
    if (fields.length === 1) {
      clearFieldsValues(id)
      return
    }

    removeField(id)
  }

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Hash,
        numberOfAdded: fields.length,
      },
    })
  }

  const handleFieldChange = (formField: string, id: number, value: any) => {
    const newState = fields.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value,
        }
      }
      return item
    })
    setFields(newState)
  }

  const submitData = (): void => {
    const data: AddFieldsToHashDto = {
      keyName: selectedKey,
      fields: fields.map((item) => {
        const defaultFields: HashFieldDto = {
          field: stringToBuffer(item.fieldName),
          value: stringToBuffer(item.fieldValue),
        }

        if (isExpireFieldsAvailable && item.fieldTTL) {
          defaultFields.expire = toNumber(item.fieldTTL)
        }

        return defaultFields
      }),
    }
    dispatch(addHashFieldsAction(data, onSuccessAdded))
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 &&
    !(item.fieldName.length || item.fieldValue.length || item.fieldTTL?.length)

  return (
    <>
      <div className={styles.container}>
        <AddMultipleFields
          items={fields}
          isClearDisabled={isClearDisabled}
          onClickRemove={onClickRemove}
          onClickAdd={addField}
        >
          {(item, index) => (
            <Row align="center">
              <FlexItem grow={2}>
                <FormField>
                  <EuiFieldText
                    fullWidth
                    name={`fieldName-${item.id}`}
                    id={`fieldName-${item.id}`}
                    placeholder="Enter Field"
                    value={item.fieldName}
                    disabled={loading}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('fieldName', item.id, e.target.value)
                    }
                    inputRef={
                      index === fields.length - 1 ? lastAddedFieldName : null
                    }
                    data-testid="hash-field"
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow={2}>
                <FormField>
                  <EuiFieldText
                    fullWidth
                    name={`fieldValue-${item.id}`}
                    id={`fieldValue-${item.id}`}
                    placeholder="Enter Value"
                    value={item.fieldValue}
                    disabled={loading}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange('fieldValue', item.id, e.target.value)
                    }
                    data-testid="hash-value"
                  />
                </FormField>
              </FlexItem>
              {isExpireFieldsAvailable && (
                <FlexItem grow={1}>
                  <FormField>
                    <EuiFieldText
                      fullWidth
                      name={`fieldTTL-${item.id}`}
                      id={`fieldTTL-${item.id}`}
                      placeholder="Enter TTL"
                      value={item.fieldTTL || ''}
                      disabled={loading}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange(
                          'fieldTTL',
                          item.id,
                          validateTTLNumberForAddKey(e.target.value),
                        )
                      }
                      data-testid="hash-ttl"
                    />
                  </FormField>
                </FlexItem>
              )}
            </Row>
          )}
        </AddMultipleFields>
      </div>
      <>
        <Row justify="end" gap="m">
          <FlexItem>
            <div>
              <SecondaryButton
                onClick={() => closePanel(true)}
                data-testid="cancel-fields-btn"
              >
                Cancel
              </SecondaryButton>
            </div>
          </FlexItem>
          <FlexItem>
            <div>
              <PrimaryButton
                disabled={loading}
                loading={loading}
                onClick={submitData}
                data-testid="save-fields-btn"
              >
                Save
              </PrimaryButton>
            </div>
          </FlexItem>
        </Row>
      </>
    </>
  )
}

export default AddHashFields
