import {
  EuiButton,
  EuiButtonIcon,
  EuiComboBox,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormFieldset,
  EuiFormRow,
  EuiHealth,
  EuiLink,
  EuiPanel,
  EuiSuperSelect,
  EuiText,
  EuiTextColor,
  EuiTitle,
  EuiToolTip
} from '@elastic/eui'
import { EuiComboBoxOptionOption } from '@elastic/eui/src/components/combo_box/types'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import Divider from 'uiSrc/components/divider/Divider'
import { GROUP_TYPES_COLORS, KeyTypes } from 'uiSrc/constants'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'

import styles from './styles.module.scss'

export interface Props {
  onCreateIndexPanel: (value: boolean) => void
  onClosePanel: () => void
}

export enum FieldTypes {
  TEXT = 'text',
  TAG = 'tag',
  NUMERIC = 'numeric',
  GEO = 'geo',
  VECTOR = 'vector',
}

const FIELD_TYPE_OPTIONS = [
  {
    text: 'TEXT',
    value: FieldTypes.TEXT,
  },
  {
    text: 'TAG',
    value: FieldTypes.TAG,
  },
  {
    text: 'NUMERIC',
    value: FieldTypes.NUMERIC,
  },
  {
    text: 'GEO',
    value: FieldTypes.GEO,
  },
  {
    text: 'VECTOR',
    value: FieldTypes.VECTOR,
  }
]

const KEY_TYPE_OPTIONS = [
  {
    text: 'Hash',
    value: KeyTypes.Hash,
    color: GROUP_TYPES_COLORS[KeyTypes.Hash],
  },
  {
    text: 'JSON',
    value: KeyTypes.JSON,
    color: GROUP_TYPES_COLORS[KeyTypes.JSON],
  },
]

const keyTypeOptions = KEY_TYPE_OPTIONS.map((item) => {
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

const fieldTypeOptions = FIELD_TYPE_OPTIONS.map(({ value, text }) => ({
  value,
  inputDisplay: text,
}))

const CreateRedisearchIndex = (props: Props) => {
  const { onCreateIndexPanel, onClosePanel } = props

  const [keyTypeSelected, setKeyTypeSelected] = useState<string>(keyTypeOptions[0].value)
  const [prefixes, setPrefixes] = useState<EuiComboBoxOptionOption[]>([])
  const [indexName, setIndexName] = useState<string>('')
  const [fields, setFields] = useState<any[]>([{ identifier: '', fieldType: fieldTypeOptions[0].value, id: 0 }])

  const lastAddedIdentifier = useRef<HTMLInputElement>(null)
  const prevCountFields = useRef<number>(0)

  useEffect(() => {
    if (prevCountFields.current !== 0 && prevCountFields.current < fields.length) {
      lastAddedIdentifier.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  const onCreateOption = (searchValue: string) => {
    setPrefixes([...prefixes, { label: searchValue }])
  }

  const addField = () => {
    const lastFieldId = fields[fields.length - 1].id
    setFields([
      ...fields,
      {
        identifier: '',
        fieldType: fieldTypeOptions[0].value,
        id: lastFieldId + 1
      }
    ])
  }

  const removeField = (id: number) => {
    setFields((fields) => fields.filter((item) => item.id !== id))
  }

  const clearFieldsValues = (id: number) => {
    setFields((fields) => fields
      .map((item) => (item.id === id ? { ...item, identifier: '', fieldType: fieldTypeOptions[0].value } : item)))
  }

  const handleFieldChange = (formField: string, id: number, value: any) => {
    setFields((fields) => fields
      .map((item) => ((item.id === id) ? { ...item, [formField]: value } : item)))
  }

  const isClearDisabled = (item: any): boolean => fields.length === 1 && !(item.identifier.length)

  return (
    <div className={styles.page}>
      <EuiFlexGroup
        justifyContent="center"
        direction="column"
        className={cx(styles.container, 'relative')}
        gutterSize="none"
      >
        <EuiFlexItem grow style={{ marginBottom: '16px' }}>
          <EuiTitle size="xs" className={styles.header}>
            <h4>New Index</h4>
          </EuiTitle>
          <EuiToolTip
            content="Close"
            position="left"
            anchorClassName={styles.closeBtnTooltip}
          >
            <EuiButtonIcon
              iconType="cross"
              color="primary"
              aria-label="Close panel"
              className={styles.closeBtn}
              data-testid="bulk-close-panel"
              onClick={onClosePanel}
            />
          </EuiToolTip>
        </EuiFlexItem>
        <EuiFlexItem className={styles.header}>
          <EuiText size="s">Use CLI or Workbench to create more advanced indexes. See more details in the
            {' '}
            <EuiLink
              color="text"
              href="https://redis.io/commands/ft.create/"
              className={styles.link}
              external={false}
              target="_blank"
            >
              documentation.
            </EuiLink>
          </EuiText>
        </EuiFlexItem>

        <Divider colorVariable="separatorColor" className={styles.divider} />

        <div className="eui-yScroll">
          <div className={styles.contentFields}>
            <div className={styles.fieldsContainer}>
              <EuiFlexGroup responsive={false} className={styles.row}>
                <EuiFlexItem>
                  <EuiFormRow label="Index Name*" fullWidth>
                    <EuiFieldText
                      fullWidth
                      name="Index name"
                      id="index-name"
                      placeholder="Enter Index Name"
                      value={indexName}
                      onChange={(e) => setIndexName(e.target.value)}
                      autoComplete="off"
                      data-testid="index-name"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormFieldset
                    legend={{ children: 'Select key type', display: 'hidden' }}
                  >
                    <EuiFormRow
                      label="Key Type*"
                      fullWidth
                    >
                      <EuiSuperSelect
                        itemClassName="withColorDefinition"
                        fullWidth
                        options={keyTypeOptions}
                        valueOfSelected={keyTypeSelected}
                        onChange={(value: string) => setKeyTypeSelected(value)}
                      />
                    </EuiFormRow>
                  </EuiFormFieldset>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup responsive={false} className={styles.row}>
                <EuiFlexItem>
                  <EuiFormRow
                    label="Prefixes"
                    fullWidth
                  >
                    <EuiComboBox
                      noSuggestions
                      isClearable={false}
                      placeholder="Enter Prefix"
                      selectedOptions={prefixes}
                      onCreateOption={onCreateOption}
                      onChange={(selectedOptions) => setPrefixes(selectedOptions)}
                      className={styles.combobox}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
              <Divider colorVariable="separatorColor" className={styles.controlsDivider} />
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
                                name={`identifier-${item.id}`}
                                id={`identifier-${item.id}`}
                                placeholder="Enter Identifier"
                                value={item.identifier}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange(
                                  'identifier',
                                  item.id,
                                  e.target.value
                                )}
                                inputRef={index === fields.length - 1 ? lastAddedIdentifier : null}
                                autoComplete="off"
                                data-testid={`identifier-${item.id}`}
                              />
                            </EuiFormRow>
                          </EuiFlexItem>
                          <EuiFlexItem grow>
                            <EuiFormRow>
                              <EuiSuperSelect
                                itemClassName="withColorDefinition"
                                options={fieldTypeOptions}
                                valueOfSelected={item.fieldType}
                                onChange={(value: string) => handleFieldChange(
                                  'fieldType',
                                  item.id,
                                  value
                                )}
                                data-testid={`field-type-${item.id}`}
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
                        loading={false}
                        anchorClassName={styles.refreshKeyTooltip}
                      />
                    </EuiFlexGroup>
                  </EuiFlexItem>
                ))
              }
            </div>
          </div>
        </div>
      </EuiFlexGroup>

      <EuiPanel
        style={{ border: 'none' }}
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        className={styles.footer}
      >
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton
              color="secondary"
              onClick={() => onClosePanel()}
              className="btn-cancel btn-back"
            >
              <EuiTextColor>Cancel</EuiTextColor>
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="m"
              color="secondary"
              onClick={() => {}}
              data-testid="create-index-btn"
            >
              Create Index
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </div>
  )
}

export default CreateRedisearchIndex
