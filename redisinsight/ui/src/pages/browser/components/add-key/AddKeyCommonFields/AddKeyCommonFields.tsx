import React, { ChangeEvent } from 'react'
import { toNumber } from 'lodash'
import {
  EuiFieldText,
  EuiFormFieldset,
  EuiSuperSelect,
} from '@elastic/eui'
import { FormField } from '@redis-ui/components'
import { MAX_TTL_NUMBER, Maybe, validateTTLNumberForAddKey } from 'uiSrc/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { AddCommonFieldsFormConfig as config } from '../constants/fields-config'

import styles from './styles.module.scss'

export interface Props {
  typeSelected: string
  onChangeType: (type: string) => void
  options: any
  loading: boolean
  keyName: string
  setKeyName: React.Dispatch<React.SetStateAction<string>>
  keyTTL: Maybe<number>
  setKeyTTL: React.Dispatch<React.SetStateAction<Maybe<number>>>
}

const AddKeyCommonFields = (props: Props) => {
  const {
    typeSelected,
    onChangeType = () => {},
    options,
    loading,
    keyName,
    setKeyName,
    keyTTL,
    setKeyTTL,
  } = props

  const handleTTLChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const target = event.currentTarget
    const value = validateTTLNumberForAddKey(target.value)
    if (value.toString().length) {
      setKeyTTL(toNumber(value))
    } else {
      setKeyTTL(undefined)
    }
  }

  return (
    <div className={styles.wrapper}>
      <Row className={styles.container}>
        <FlexItem grow>
          <EuiFormFieldset
            legend={{ children: 'Select key type', display: 'hidden' }}
          >
            <FormField label="Key Type*">
              <EuiSuperSelect
                itemClassName="withColorDefinition"
                fullWidth
                disabled={loading}
                options={options}
                valueOfSelected={typeSelected}
                onChange={(value: string) => onChangeType(value)}
                data-testid="select-key-type"
              />
            </FormField>
          </EuiFormFieldset>
        </FlexItem>
        <FlexItem grow>
          <FormField label={config.keyTTL.label}>
            <EuiFieldText
              fullWidth
              name={config.keyTTL.name}
              id={config.keyTTL.name}
              maxLength={200}
              min={0}
              max={MAX_TTL_NUMBER}
              placeholder={config.keyTTL.placeholder}
              value={`${keyTTL ?? ''}`}
              onChange={handleTTLChange}
              disabled={loading}
              autoComplete="off"
              data-testid="ttl"
            />
          </FormField>
        </FlexItem>
      </Row>
      <FormField label={config.keyName.label}>
        <EuiFieldText
          fullWidth
          name={config.keyName.name}
          id={config.keyName.name}
          value={keyName}
          placeholder={config.keyName.placeholder}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setKeyName(e.target.value)
          }
          disabled={loading}
          autoComplete="off"
          data-testid="key"
        />
      </FormField>
    </div>
  )
}

export default AddKeyCommonFields
