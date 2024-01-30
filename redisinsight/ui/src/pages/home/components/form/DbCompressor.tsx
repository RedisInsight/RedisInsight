import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
  htmlIdGenerator,
} from '@elastic/eui'
import cx from 'classnames'
import { FormikProps } from 'formik'

import { KeyValueCompressor } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { NONE } from 'uiSrc/pages/home/constants'
import styles from '../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const DbCompressor = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props

  const optionsCompressor: EuiSuperSelectOption<string>[] = [
    {
      value: NONE,
      inputDisplay: 'No decompression',
    },
    {
      value: KeyValueCompressor.GZIP,
      inputDisplay: 'GZIP',
    },
    {
      value: KeyValueCompressor.LZ4,
      inputDisplay: 'LZ4',
    },
    {
      value: KeyValueCompressor.SNAPPY,
      inputDisplay: 'SNAPPY',
    },
    {
      value: KeyValueCompressor.ZSTD,
      inputDisplay: 'ZSTD',
    },
    {
      value: KeyValueCompressor.Brotli,
      inputDisplay: 'Brotli'
    },
    {
      value: KeyValueCompressor.PHPGZCompress,
      inputDisplay: 'PHP GZCompress'
    },
  ]

  const handleChangeDbCompressorCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('compressor', NONE)
    }
    formik.setFieldValue(
      'showCompressor',
      isChecked
    )
  }

  return (
    <>
      <EuiFlexGroup
        className={cx(flexGroupClassName, {
          [styles.tlsContainer]: !flexGroupClassName
        })}
        responsive={false}
      >
        <EuiFlexItem
          grow={false}
          className={flexItemClassName}
        >
          <EuiFormRow>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} over db compressor`}
              name="showCompressor"
              label="Enable automatic data decompression"
              checked={!!formik.values.showCompressor}
              onChange={handleChangeDbCompressorCheckbox}
              data-testid="showCompressor"
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      {formik.values.showCompressor && (
        <EuiFlexGroup
          className={flexGroupClassName}
        >
          <EuiFlexItem
            className={cx(
              flexItemClassName,
            )}
          >
            <EuiFormRow label="Decompression format">
              <EuiSuperSelect
                name="compressor"
                placeholder="Decompression format"
                valueOfSelected={
                    formik.values.compressor ?? NONE
                  }
                options={optionsCompressor}
                onChange={(value) => {
                  formik.setFieldValue(
                    'compressor',
                    value || NONE
                  )
                }}
                data-testid="select-compressor"
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </>
  )
}

export default DbCompressor
