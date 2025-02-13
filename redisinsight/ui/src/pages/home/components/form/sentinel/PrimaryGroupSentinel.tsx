import React from 'react'
import { EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiFormRow } from '@elastic/eui'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const PrimaryGroupSentinel = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props
  return (
    <>
      <EuiFlexGroup className={flexGroupClassName}>
        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Database Alias*">
            <EuiFieldText
              fullWidth
              name="name"
              id="name"
              data-testid="name"
              placeholder="Enter Database Alias"
              value={formik.values.name ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup className={flexGroupClassName}>
        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Primary Group Name*">
            <EuiFieldText
              fullWidth
              name="sentinelMasterName"
              id="sentinelMasterName"
              data-testid="primary-group"
              placeholder="Enter Primary Group Name"
              value={formik.values.sentinelMasterName ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
              disabled
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default PrimaryGroupSentinel
