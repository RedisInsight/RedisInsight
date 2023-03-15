import React, { ChangeEvent } from 'react'
import { toNumber } from 'lodash'
import {
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormFieldset,
  EuiFormRow,
  EuiSuperSelect
} from '@elastic/eui'
import { MAX_TTL_NUMBER, Maybe, validateTTLNumberForAddKey } from 'uiSrc/utils'

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
    setKeyTTL
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
      <EuiFlexGroup className={styles.container} responsive={false}>
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
                disabled={loading}
                options={options}
                valueOfSelected={typeSelected}
                onChange={(value: string) => onChangeType(value)}
                data-testid="select-key-type"
              />
            </EuiFormRow>
          </EuiFormFieldset>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label={config.keyTTL.label} fullWidth>
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
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFormRow label={config.keyName.label} fullWidth>
        <EuiFieldText
          fullWidth
          name={config.keyName.name}
          id={config.keyName.name}
          value={keyName}
          placeholder={config.keyName.placeholder}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setKeyName(e.target.value)}
          disabled={loading}
          autoComplete="off"
          data-testid="key"
        />
      </EuiFormRow>
    </div>
  )
}

export default AddKeyCommonFields
