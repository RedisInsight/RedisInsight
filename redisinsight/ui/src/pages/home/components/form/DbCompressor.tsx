import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFormRow,
  EuiSuperSelect,
  EuiSuperSelectOption,
  htmlIdGenerator,
} from '@elastic/eui'
import { FormikProps } from 'formik'

import { KeyValueCompressor } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { NONE } from 'uiSrc/pages/home/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const DbCompressor = (props: Props) => {
  const { formik } = props

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
      inputDisplay: 'Brotli',
    },
    {
      value: KeyValueCompressor.PHPGZCompress,
      inputDisplay: 'PHP GZCompress',
    },
  ]

  const handleChangeDbCompressorCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    const isChecked = e.target.checked
    if (!isChecked) {
      // Reset db field to initial value
      formik.setFieldValue('compressor', NONE)
    }
    formik.setFieldValue('showCompressor', isChecked)
  }

  return (
    <>
      <Row gap="m" responsive={false}>
        <FlexItem>
          <EuiFormRow>
            <EuiCheckbox
              id={`${htmlIdGenerator()()} over db compressor`}
              name="showCompressor"
              label="Enable Automatic Data Decompression"
              checked={!!formik.values.showCompressor}
              onChange={handleChangeDbCompressorCheckbox}
              data-testid="showCompressor"
            />
          </EuiFormRow>
        </FlexItem>
      </Row>

      {formik.values.showCompressor && (
        <>
          <Spacer />
          <Row gap="m">
            <FlexItem grow>
              <EuiFormRow label="Decompression format">
                <EuiSuperSelect
                  name="compressor"
                  placeholder="Decompression format"
                  valueOfSelected={formik.values.compressor ?? NONE}
                  options={optionsCompressor}
                  onChange={(value) => {
                    formik.setFieldValue('compressor', value || NONE)
                  }}
                  data-testid="select-compressor"
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

export default DbCompressor
