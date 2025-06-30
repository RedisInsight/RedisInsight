import {
  EuiFieldText,
  EuiFormFieldset,
  EuiPanel,
  EuiPopover,
  EuiSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui'
import { EuiComboBoxOptionOption } from '@elastic/eui/src/components/combo_box/types'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Divider from 'uiSrc/components/divider/Divider'
import {
  createIndexStateSelector,
  createRedisearchIndexAction,
} from 'uiSrc/slices/browser/redisearch'
import { stringToBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { getFieldTypeOptions } from 'uiSrc/utils/redisearch'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { AutoTag } from 'uiSrc/components/base/forms/combo-box/AutoTag'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { HealthText, Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
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
      <HealthText
        color={color}
        style={{ lineHeight: 'inherit' }}
        data-test-subj={value}
      >
        {text}
      </HealthText>
    ),
  }
})

const initialFieldValue = (
  fieldTypeOptions: EuiSuperSelectOption<string>[],
  id = 0,
) => ({
  id,
  identifier: '',
  fieldType: fieldTypeOptions[0]?.value || '',
})

const CreateRedisearchIndex = ({ onClosePanel, onCreateIndex }: Props) => {
  const { viewType } = useSelector(keysSelector)
  const { loading } = useSelector(createIndexStateSelector)
  const { id: instanceId, modules } = useSelector(connectedInstanceSelector)

  const [keyTypeSelected, setKeyTypeSelected] =
    useState<RedisearchIndexKeyType>(keyTypeOptions[0].value)
  const [prefixes, setPrefixes] = useState<EuiComboBoxOptionOption[]>([])
  const [indexName, setIndexName] = useState<string>('')
  const [fieldTypeOptions, setFieldTypeOptions] =
    useState<EuiSuperSelectOption<string>[]>(getFieldTypeOptions)
  const [fields, setFields] = useState<any[]>([
    initialFieldValue(fieldTypeOptions),
  ])

  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false)

  const lastAddedIdentifier = useRef<HTMLInputElement>(null)
  const prevCountFields = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    if (
      prevCountFields.current !== 0 &&
      prevCountFields.current < fields.length
    ) {
      lastAddedIdentifier.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  useEffect(() => {
    setFieldTypeOptions(getFieldTypeOptions)
  }, [modules])

  const addField = () => {
    const lastFieldId = fields[fields.length - 1].id
    setFields([...fields, initialFieldValue(fieldTypeOptions, lastFieldId + 1)])
  }

  const removeField = (id: number) => {
    setFields((fields) => fields.filter((item) => item.id !== id))
  }

  const clearFieldsValues = (id: number) => {
    setFields((fields) =>
      fields.map((item) =>
        item.id === id ? initialFieldValue(fieldTypeOptions, id) : item,
      ),
    )
  }

  const onClickRemove = ({ id }: any) => {
    if (fields.length === 1) {
      clearFieldsValues(id)
      return
    }

    removeField(id)
  }

  const handleFieldChange = (formField: string, id: number, value: string) => {
    setFields((fields) =>
      fields.map((item) =>
        item.id === id ? { ...item, [formField]: value } : item,
      ),
    )
  }

  const submitData = () => {
    const data: CreateRedisearchIndexDto = {
      index: stringToBuffer(indexName),
      type: keyTypeSelected,
      prefixes: prefixes.map((p) => stringToBuffer(p.label as string)),
      fields: fields.map((item) => ({
        name: stringToBuffer(item.identifier),
        type: item.fieldType,
      })),
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
      },
    })

    onCreateIndex?.()
  }

  const isClearDisabled = (item: any): boolean =>
    fields.length === 1 && !item.identifier.length

  const IdentifierInfo = () => (
    <EuiPopover
      anchorPosition="upCenter"
      isOpen={isInfoPopoverOpen}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('euiToolTip', 'popoverLikeTooltip')}
      closePopover={() => setIsInfoPopoverOpen(false)}
      initialFocus={false}
      button={
        <IconButton
          icon={InfoIcon}
          id="identifier-info-icon"
          aria-label="identifier info icon"
          data-testid="identifier-info-icon"
          className={styles.infoIcon}
          onClick={() =>
            setIsInfoPopoverOpen((isPopoverOpen) => !isPopoverOpen)
          }
        />
      }
    >
      <>
        <Link
          href={getUtmExternalLink(
            'https://redis.io/commands/ft.create/#SCHEMA',
            {
              campaign: 'browser_search',
            },
          )}
          target="_blank"
        >
          Declares
        </Link>
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
            <Row className={styles.row}>
              <FlexItem grow>
                <FormField label="Index Name">
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
                </FormField>
              </FlexItem>
              <FlexItem grow>
                <EuiFormFieldset
                  legend={{ children: 'Select key type', display: 'hidden' }}
                >
                  <FormField label="Key Type*">
                    <EuiSuperSelect
                      itemClassName="withColorDefinition"
                      fullWidth
                      options={keyTypeOptions}
                      valueOfSelected={keyTypeSelected}
                      onChange={(value: RedisearchIndexKeyType) =>
                        setKeyTypeSelected(value)
                      }
                      data-testid="key-type"
                    />
                  </FormField>
                </EuiFormFieldset>
              </FlexItem>
            </Row>
            <Row className={styles.row} style={{ maxWidth: '100%' }}>
              <FlexItem grow style={{ minWidth: '100%', maxWidth: '100%' }}>
                <AutoTag
                  label="Key Prefixes"
                  placeholder="Enter Prefix"
                  selectedOptions={prefixes}
                  onCreateOption={(searchValue) =>
                    setPrefixes([...prefixes, { label: searchValue }])
                  }
                  onChange={(selectedOptions) => setPrefixes(selectedOptions)}
                  className={styles.combobox}
                  data-testid="prefix-combobox"
                />
              </FlexItem>
            </Row>
            <Divider
              colorVariable="separatorColor"
              className={styles.controlsDivider}
            />
            <Text color="subdued">
              Identifier
              {IdentifierInfo()}
            </Text>

            <AddMultipleFields
              items={fields}
              isClearDisabled={isClearDisabled}
              onClickRemove={onClickRemove}
              onClickAdd={addField}
            >
              {(item, index) => (
                <Row align="center">
                  <FlexItem grow>
                    <FormField>
                      <EuiFieldText
                        fullWidth
                        name={`identifier-${item.id}`}
                        id={`identifier-${item.id}`}
                        placeholder="Enter Identifier"
                        value={item.identifier}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange(
                            'identifier',
                            item.id,
                            e.target.value,
                          )
                        }
                        inputRef={
                          index === fields.length - 1
                            ? lastAddedIdentifier
                            : null
                        }
                        autoComplete="off"
                        data-testid={`identifier-${item.id}`}
                      />
                    </FormField>
                  </FlexItem>
                  <FlexItem grow>
                    <FormField>
                      <EuiSuperSelect
                        itemClassName="withColorDefinition"
                        options={fieldTypeOptions}
                        valueOfSelected={item.fieldType}
                        onChange={(value: string) =>
                          handleFieldChange('fieldType', item.id, value)
                        }
                        data-testid={`field-type-${item.id}`}
                      />
                    </FormField>
                  </FlexItem>
                </Row>
              )}
            </AddMultipleFields>
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
        <Row justify="end" gap="m">
          <FlexItem>
            <SecondaryButton
              color="secondary"
              onClick={() => onClosePanel?.()}
              className="btn-cancel btn-back"
              data-testid="create-index-cancel-btn"
            >
              Cancel
            </SecondaryButton>
          </FlexItem>
          <FlexItem>
            <PrimaryButton
              size="m"
              loading={loading}
              disabled={loading}
              onClick={submitData}
              data-testid="create-index-btn"
            >
              Create Index
            </PrimaryButton>
          </FlexItem>
        </Row>
      </EuiPanel>
    </>
  )
}

export default CreateRedisearchIndex
