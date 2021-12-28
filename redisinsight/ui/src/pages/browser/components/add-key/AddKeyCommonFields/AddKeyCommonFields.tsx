import React, { ChangeEvent } from 'react'
import { toNumber } from 'lodash'
import { EuiFieldText, EuiFormRow } from '@elastic/eui'

import { MAX_TTL_NUMBER, Maybe, validateTTLNumberForAddKey } from 'uiSrc/utils'
import { IAddCommonFieldsFormConfig } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'

export interface Props {
  config: IAddCommonFieldsFormConfig,
  loading: boolean,
  keyName: string,
  setKeyName: React.Dispatch<React.SetStateAction<string>>,
  keyTTL: Maybe<number>,
  setKeyTTL: React.Dispatch<React.SetStateAction<Maybe<number>>>
}

const AddKeyCommonFields = (props: Props) => {
  const {
    config,
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
    <>
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
          data-testid="key"
        />
      </EuiFormRow>
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
          data-testid="ttl"
        />
      </EuiFormRow>
    </>
  )
}

export default AddKeyCommonFields
