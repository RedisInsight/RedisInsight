import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  EuiButton,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldText,
  EuiPanel,
} from '@elastic/eui'
import { selectedKeyDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  updateHashValueStateSelector,
  resetUpdateValue,
  addHashFieldsAction,
} from 'uiSrc/slices/browser/hash'
import { KeyTypes } from 'uiSrc/constants'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

import { stringToBuffer } from 'uiSrc/utils'
import { AddFieldsToHashDto } from 'apiSrc/modules/browser/hash/dto'
import styles from '../styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

export interface IHashFieldState {
  fieldName: string;
  fieldValue: string;
  id: number;
}

export const INITIAL_HASH_FIELD_STATE: IHashFieldState = {
  fieldName: '',
  fieldValue: '',
  id: 0,
}

const AddHashFields = (props: Props) => {
  const { closePanel } = props
  const dispatch = useDispatch()
  const [fields, setFields] = useState<IHashFieldState[]>([{ ...INITIAL_HASH_FIELD_STATE }])
  const { loading } = useSelector(updateHashValueStateSelector)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? { name: undefined }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const lastAddedFieldName = useRef<HTMLInputElement>(null)

  useEffect(() =>
    // componentWillUnmount
    () => {
      dispatch(resetUpdateValue())
    },
  [])

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
    const newState = fields.map((item) => (item.id === id
      ? {
        ...item,
        fieldName: '',
        fieldValue: '',
      }
      : item))
    setFields(newState)
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
        keyType: KeyTypes.Hash,
        numberOfAdded: fields.length,
      }
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
      fields: fields.map((item) => ({
        field: stringToBuffer(item.fieldName),
        value: stringToBuffer(item.fieldValue,)
      })),
    }
    dispatch(addHashFieldsAction(data, onSuccessAdded))
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 && !(item.fieldName.length || item.fieldValue.length)

  return (
    <>
      <EuiPanel
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        data-test-subj="add-hash-field-panel"
        className={cx('eui-yScroll', 'flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        {fields.map((item, index) => (
          <EuiFlexItem style={{ marginBottom: '8px' }} grow key={item.id}>
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem grow>
                <EuiFlexGroup gutterSize="none" alignItems="center">
                  <EuiFlexItem grow>
                    <EuiFormRow fullWidth>
                      <EuiFieldText
                        fullWidth
                        name={`fieldName-${item.id}`}
                        id={`fieldName-${item.id}`}
                        placeholder="Enter Field"
                        value={item.fieldName}
                        disabled={loading}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('fieldName', item.id, e.target.value)}
                        inputRef={index === fields.length - 1 ? lastAddedFieldName : null}
                        data-testid="hash-field"
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow>
                    <EuiFormRow fullWidth>
                      <EuiFieldText
                        fullWidth
                        name={`fieldValue-${item.id}`}
                        id={`fieldValue-${item.id}`}
                        placeholder="Enter Value"
                        value={item.fieldValue}
                        disabled={loading}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange('fieldValue', item.id, e.target.value)}
                        data-testid="hash-value"
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
        ))}
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
              <EuiButton color="secondary" onClick={() => closePanel(true)} data-testid="cancel-fields-btn">
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
                disabled={loading}
                isLoading={loading}
                onClick={submitData}
                data-testid="save-fields-btn"
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

export default AddHashFields
