import React from 'react'
import {
  EuiFieldPassword,
  EuiFieldText,
  EuiFormRow,
  EuiText,
  EuiTextColor,
} from '@elastic/eui'
import { FormikProps } from 'formik'

import { Nullable } from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from '../../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
  isCloneMode: boolean
  db: Nullable<number>
}

const SentinelMasterDatabase = (props: Props) => {
  const {
    db,
    isCloneMode,
    flexGroupClassName = '',
    flexItemClassName = '',
    formik,
  } = props
  return (
    <>
      {!!db && !isCloneMode && (
        <EuiText color="subdued" className={styles.sentinelCollapsedField}>
          Database Index:
          <span style={{ paddingLeft: 5 }}>
            <EuiTextColor>{db}</EuiTextColor>
          </span>
        </EuiText>
      )}
      <Row gap="m" responsive className={flexGroupClassName}>
        <FlexItem grow className={flexItemClassName}>
          <EuiFormRow label="Username">
            <EuiFieldText
              name="sentinelMasterUsername"
              id="sentinelMasterUsername"
              fullWidth
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.sentinelMasterUsername ?? ''}
              onChange={formik.handleChange}
              data-testid="sentinel-mater-username"
            />
          </EuiFormRow>
        </FlexItem>

        <FlexItem grow className={flexItemClassName}>
          <EuiFormRow label="Password">
            <EuiFieldPassword
              type="password"
              name="sentinelMasterPassword"
              id="sentinelMasterPassword"
              data-testid="sentinel-master-password"
              fullWidth
              className="passwordField"
              maxLength={200}
              placeholder="Enter Password"
              value={
                formik.values.sentinelMasterPassword === true
                  ? SECURITY_FIELD
                  : (formik.values.sentinelMasterPassword ?? '')
              }
              onChange={formik.handleChange}
              onFocus={() => {
                if (formik.values.sentinelMasterPassword === true) {
                  formik.setFieldValue('sentinelMasterPassword', '')
                }
              }}
              dualToggleProps={{ color: 'text' }}
              autoComplete="new-password"
            />
          </EuiFormRow>
        </FlexItem>
      </Row>
    </>
  )
}

export default SentinelMasterDatabase
