import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFieldNumber,
  EuiFormRow,
  htmlIdGenerator,
} from '@elastic/eui'
import { FormikProps } from 'formik'

import { validateNumber } from 'uiSrc/utils'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import styles from '../styles.module.scss'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { formik } = props

  const handleChangeDbIndexCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('db', null)
    }
    formik.handleChange(e)
  }

  return (
    <>
      <Row gap="s">
        <FlexItem>
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
        </FlexItem>
      </Row>

      {formik.values.showDb && (
        <>
          <Spacer />
          <Row gap="m" responsive>
            <FlexItem grow className={styles.dbInput}>
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
                      validateNumber(e.target.value.trim()),
                    )
                  }}
                  type="text"
                  min={0}
                />
              </EuiFormRow>
            </FlexItem>
            <FlexItem grow />
          </Row>
        </>
      )}
    </>
  )
}

export default DbIndex
