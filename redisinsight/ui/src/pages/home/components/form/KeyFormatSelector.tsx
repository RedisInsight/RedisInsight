import React from 'react'
import { FormikProps } from 'formik'
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
} from '@elastic/eui'

import { KeyValueFormat } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const KeyFormatSelector = (props: Props) => {
  const { formik } = props

  const options: EuiSuperSelectOption<string>[] = [
    {
      value: KeyValueFormat.Unicode,
      inputDisplay: 'Unicode',
    },
    {
      value: KeyValueFormat.HEX,
      inputDisplay: 'HEX',
    },
  ]

  return (
    <EuiFlexGroup responsive={false}>
      <EuiFlexItem>
        <EuiFormRow label="Key name format">
          <EuiSuperSelect
            name="key-name-format"
            placeholder="Key name format"
            // TODO: fix the type
            valueOfSelected={
              (formik.values.keyNameFormat as unknown as string) ||
              KeyValueFormat.Unicode
            }
            options={options}
            onChange={(value) => {
              formik.setFieldValue('keyNameFormat', value)
            }}
            data-testid="select-key-name-format"
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem />
    </EuiFlexGroup>
  )
}

export default KeyFormatSelector
