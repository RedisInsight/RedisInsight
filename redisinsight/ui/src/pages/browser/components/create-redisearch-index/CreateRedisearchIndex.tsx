import {
  EuiButton,
  EuiComboBox,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormFieldset,
  EuiFormRow,
  EuiHealth,
  EuiPanel,
  EuiSuperSelect,
  EuiTextColor,
  EuiText,
  EuiLink,
  EuiPopover,
  EuiButtonIcon,
  EuiSuperSelectOption,
} from '@elastic/eui'
import { EuiComboBoxOptionOption } from '@elastic/eui/src/components/combo_box/types'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Divider from 'uiSrc/components/divider/Divider'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'
import { createIndexStateSelector, createRedisearchIndexAction } from 'uiSrc/slices/browser/redisearch'
import { stringToBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { getFieldTypeOptions } from 'uiSrc/utils/redisearch'
import { CreateRedisearchIndexDto } from 'apiSrc/modules/browser/redisearch/dto'

import { KEY_TYPE_OPTIONS, RedisearchIndexKeyType } from './constants'

import styles from './styles.module.scss'

export interface Props {
  onClosePanel?: () => void
  onCreateIndex?: () => void
}

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

const initialFieldValue = (fieldTypeOptions: EuiSuperSelectOption<string>[], id = 0) => ({ id, identifier: '', fieldType: fieldTypeOptions[0].value })

const CreateRedisearchIndex = ({ onClosePanel, onCreateIndex }: Props) => {
  const { viewType } = useSelector(keysSelector)
  const { loading } = useSelector(createIndexStateSelector)
  const { id: instanceId, modules } = useSelector(connectedInstanceSelector)

  const [keyTypeSelected, setKeyTypeSelected] = useState<RedisearchIndexKeyType>(keyTypeOptions[0].value)
  const [prefixes, setPrefixes] = useState<EuiComboBoxOptionOption[]>([])
  const [indexName, setIndexName] = useState<string>('')
  const [fieldTypeOptions, setFieldTypeOptions] = useState<EuiSuperSelectOption<string>[]>(getFieldTypeOptions(modules))
  const [fields, setFields] = useState<any[]>([initialFieldValue(fieldTypeOptions)])

  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)

  const lastAddedIdentifier = useRef<HTMLInputElement>(null)
  const prevCountFields = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    if (prevCountFields.current !== 0 && prevCountFields.current < fields.length) {
      lastAddedIdentifier.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  useEffect(() => {
    setFieldTypeOptions(getFieldTypeOptions(modules))
  }, [modules])

  const addField = () => {
    const lastFieldId = fields[fields.length - 1].id
    setFields([...fields, initialFieldValue(fieldTypeOptions, lastFieldId + 1)])
  }

  const removeField = (id: number) => {
    setFields((fields) => fields.filter((item) => item.id !== id))
  }

  const clearFieldsValues = (id: number) => {
    setFields((fields) => fields.map((item) => (item.id === id ? initialFieldValue(fieldTypeOptions, id) : item)))
  }

  const handleFieldChange = (formField: string, id: number, value: string) => {
    setFields((fields) => fields.map((item) => ((item.id === id) ? { ...item, [formField]: value } : item)))
  }

  const submitData = () => {
    const data: CreateRedisearchIndexDto = {
      index: stringToBuffer(indexName),
      type: keyTypeSelected,
      prefixes: prefixes.map((p) => stringToBuffer(p.label as string)),
      fields: fields.map((item) => ({
        name: stringToBuffer(item.identifier),
        type: item.fieldType
      }))
    }

    dispatch(createRedisearchIndexAction(data, onSuccess))
  }

  const onSuccess = (data: CreateRedisearchIndexDto) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_INDEX_ADDED,
      eventData: {
        databaseId: instanceId,
        view: viewType,
        dataType: data.type,
        countOfPrefixes: data.prefixes?.length || 0,
        countOfFieldNames: data.fields?.length || 0,
      }
    })

    onCreateIndex?.()
  }

  const isClearDisabled = (item: any): boolean => fields.length === 1 && !(item.identifier.length)

  const IdentifierInfo = () => (
    <EuiPopover
      anchorPosition="upCenter"
      isOpen={isInfoPopoverOpen}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip')}
      closePopover={() => setIsInfoPopoverOpen(false)}
      initialFocus={false}
      button={(
        <EuiButtonIcon
          iconType="iInCircle"
          color="subdued"
          id="identifier-info-icon"
          aria-label="identifier info icon"
          data-testid="identifier-info-icon"
          className={styles.infoIcon}
          onClick={() => setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)}
        />
      )}
    >
      <>
        <EuiLink
          external={false}
          href="https://redis.io/commands/ft.create/#SCHEMA"
          target="_blank"
        >
          Declares
        </EuiLink>
        {' fields to index. '}
        {keyTypeSelected === RedisearchIndexKeyType.HASH
          ? 'Enter a hash field name.'
          : 'Enter a JSON path expression.'}

      </>
    </EuiPopover>
  )

  return (
    <>
      <div className="eui-yScroll">
        <div className={styles.contentFields}>
          <div className={styles.fieldsContainer}>
            <EuiFlexGroup responsive={false} className={styles.row}>
              <EuiFlexItem>
                <EuiFormRow label="Index Name" fullWidth>
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
                      onChange={(value: RedisearchIndexKeyType) => setKeyTypeSelected(value)}
                      data-testid="key-type"
                    />
                  </EuiFormRow>
                </EuiFormFieldset>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup responsive={false} className={styles.row} style={{ maxWidth: '100%' }}>
              <EuiFlexItem style={{ minWidth: '100%', maxWidth: '100%' }}>
                <EuiFormRow
                  label="Key Prefixes"
                  fullWidth
                >
                  <EuiComboBox
                    noSuggestions
                    isClearable={false}
                    placeholder="Enter Prefix"
                    selectedOptions={prefixes}
                    onCreateOption={(searchValue) => setPrefixes([...prefixes, { label: searchValue }])}
                    onChange={(selectedOptions) => setPrefixes(selectedOptions)}
                    className={styles.combobox}
                    data-testid="prefix-combobox"
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
            <Divider colorVariable="separatorColor" className={styles.controlsDivider} />
            <EuiText color="subdued">
              Identifier
              {IdentifierInfo()}
            </EuiText>

            {
              fields.map((item, index) => (
                <EuiFlexItem
                  key={item.id}
                  className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
                  grow
                  style={{ marginBottom: '8px', marginTop: '10px' }}
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
                      loading={loading}
                      anchorClassName={styles.refreshKeyTooltip}
                    />
                  </EuiFlexGroup>
                </EuiFlexItem>
              ))
            }
          </div>
        </div>
      </div>
      <EuiPanel
        style={{ border: 'none' }}
        color="transparent"
        hasShadow={false}
        borderRadius="none"
        className={styles.footer}
      >
        <EuiFlexGroup justifyContent="flexEnd" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButton
              color="secondary"
              onClick={() => onClosePanel?.()}
              className="btn-cancel btn-back"
              data-testid="create-index-cancel-btn"
            >
              <EuiTextColor>Cancel</EuiTextColor>
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="m"
              color="secondary"
              isLoading={loading}
              isDisabled={loading}
              onClick={submitData}
              data-testid="create-index-btn"
            >
              Create Index
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  )
}

export default CreateRedisearchIndex
