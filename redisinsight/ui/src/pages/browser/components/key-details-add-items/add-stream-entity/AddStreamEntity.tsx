import React, { ChangeEvent, useEffect, useRef } from 'react'
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiIcon,
  EuiSpacer, EuiText,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'

import { AddStreamFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'

import styles from './styles.module.scss'

export interface Props {
  compressed?: boolean
  entryID: string
  handleEntryIdChange: (e: ChangeEvent<HTMLInputElement>) => void
  fields: any[]
  handleFieldChange: (formField: string, id: number, value: any) => void
  handleClickRemove: (id: number) => void
  addField: () => void
}

const AddStreamEntity = (props: Props) => {
  const {
    entryID,
    fields,
    addField,
    handleEntryIdChange,
    handleFieldChange,
    handleClickRemove
  } = props

  const prevCountFields = useRef<number>(0)
  const lastAddedFieldName = useRef<HTMLInputElement>(null)

  const isClearDisabled = (item: any): boolean =>
    fields.length === 1 && !(item.fieldName.length || item.fieldValue.length)

  useEffect(() => {
    if (prevCountFields.current !== 0 && prevCountFields.current < fields.length) {
      lastAddedFieldName.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  return (
    <div className={styles.container}>
      <div className={styles.entryIdContainer}>
        <EuiFormRow label={config.entryId.label}>
          <EuiFieldText
            fullWidth
            name={config.entryId.name}
            id={config.entryId.name}
            placeholder={config.entryId.placeholder}
            value={entryID}
            onChange={handleEntryIdChange}
            append={(
              <EuiToolTip
                anchorClassName="inputAppendIcon"
                className={styles.entryIdTooltip}
                position="left"
                title="Enter Valid ID or *"
                content={(
                  <>
                    Valid ID must be in a Timestamp-Sequence Number format and be greater than the last ID.
                    <EuiSpacer size="xs" />
                    Type * to use auto-generated ID based on the Database current time.
                  </>
                )}
              >
                <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
              </EuiToolTip>
            )}
            data-testid={config.entryId.name}
          />
        </EuiFormRow>
        <span className={styles.timestampText}>Timestamp - Sequence Number or *</span>
      </div>

      <div className={styles.fieldsWrapper}>
        <div className={cx(styles.fieldsContainer)}>
          {
            fields.map((item, index) => (
              <EuiFlexItem
                key={item.id}
                className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace', styles.row)}
                grow
              >
                <EuiFlexGroup gutterSize="none">
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
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange(
                                'fieldName',
                                item.id,
                                e.target.value
                              )}
                            inputRef={index === fields.length - 1 ? lastAddedFieldName : null}
                            autoComplete="off"
                            data-testid="field-name"
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                      <EuiFlexItem grow>
                        <EuiFormRow fullWidth>
                          <EuiFieldText
                            fullWidth
                            className={styles.fieldValue}
                            name={`fieldValue-${item.id}`}
                            id={`fieldValue-${item.id}`}
                            placeholder={config.fieldValue.placeholder}
                            value={item.fieldValue}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange(
                                'fieldValue',
                                item.id,
                                e.target.value
                              )}
                            autoComplete="off"
                            data-testid="field-value"
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
                {!isClearDisabled(item) && (
                  <div className={styles.deleteBtn}>
                    <EuiToolTip
                      content={fields.length === 1 ? 'Clear' : 'Remove'}
                      position="left"
                    >
                      <EuiButtonIcon
                        iconType="trash"
                        color="primary"
                        aria-label={fields.length === 1 ? 'Clear Item' : 'Remove Item'}
                        onClick={() => handleClickRemove(item.id)}
                        data-testid="remove-item"
                      />
                    </EuiToolTip>
                  </div>
                )}
              </EuiFlexItem>
            ))
          }
        </div>
        <EuiButtonEmpty
          size="s"
          className={styles.addRowBtn}
          type="submit"
          onClick={() => addField()}
          iconType="plusInCircle"
          data-testid="add-new-row"
        >
          <EuiText size="s">Add Row</EuiText>
        </EuiButtonEmpty>
      </div>
    </div>
  )
}

export default AddStreamEntity
