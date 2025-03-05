import { FormikProps } from 'formik'
import React from 'react'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { DbCompressor } from 'uiSrc/pages/home/components/form'

const DecompressionAndFormatters = ({
  formik,
}: {
  formik: FormikProps<DbConnectionInfo>
}) => (
  <>
    <DbCompressor formik={formik} />
  </>
)

export default DecompressionAndFormatters
