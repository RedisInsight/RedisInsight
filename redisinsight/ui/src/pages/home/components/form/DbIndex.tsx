import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  htmlIdGenerator
} from '@elastic/eui'
import { FormikProps } from 'formik'

import { validateNumber } from 'uiSrc/utils'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import styles from '../styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { formik } = props

  const handleChangeDbIndexCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('db', null)
    }
    formik.handleChange(e)
  }

  return (
    <>
      <EuiFlexGroup
        responsive={false}
        gutterSize="xs"
      >
        <EuiFlexItem
          grow={false}
        >
          <EuiFormRow>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} over db`}
              name="showDb"
              label="Select Logical Database"
              checked={!!formik.values.showDb}
              onChange={handleChangeDbIndexCheckbox}
              data-testid="showDb"
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      {formik.values.showDb && (
        <>
          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem className={styles.dbInput}>
              <EuiFormRow label="Database Index">
                <EuiFieldNumber
                  name="db"
                  id="db"
                  data-testid="db"
                  placeholder="Enter Database Index"
                  value={formik.values.db ?? '0'}
                  maxLength={6}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(
                      e.target.name,
                      validateNumber(e.target.value.trim())
                    )
                  }}
                  type="text"
                  min={0}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem />
          </EuiFlexGroup>
        </>
      )}
    </>
  )
}

export default DbIndex
