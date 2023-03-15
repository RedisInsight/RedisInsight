import React, { ChangeEvent } from 'react'
import { EuiCheckbox, EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiFormRow, htmlIdGenerator } from '@elastic/eui'
import cx from 'classnames'
import { FormikProps } from 'formik'

import { validateNumber } from 'uiSrc/utils'

import { DbConnectionInfo } from '../interfaces'
import styles from '../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const DbIndex = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props

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
        className={cx(flexGroupClassName, {
          [styles.tlsContainer]: !flexGroupClassName
        })}
        responsive={false}
        style={{ marginTop: 10 }}
      >
        <EuiFlexItem
          grow={false}
          className={flexItemClassName}
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
        <EuiFlexGroup
          className={flexGroupClassName}
        >
          <EuiFlexItem
            className={cx(
              flexItemClassName,
              styles.dbInput,
              { [styles.dbInputBig]: !flexItemClassName }
            )}
          >
            <EuiFormRow label="Database Index">
              <EuiFieldNumber
                name="db"
                id="db"
                data-testid="db"
                style={{ width: 120 }}
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
        </EuiFlexGroup>
      )}
    </>
  )
}

export default DbIndex
