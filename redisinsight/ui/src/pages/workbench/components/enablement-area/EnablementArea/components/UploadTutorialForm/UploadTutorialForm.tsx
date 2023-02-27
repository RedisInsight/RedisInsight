import React, { useState } from 'react'
import { EuiButton, EuiButtonIcon, EuiFieldText, EuiSpacer, EuiText, EuiToolTip } from '@elastic/eui'
import { useFormik } from 'formik'
import { FormikErrors } from 'formik/dist/types'
import { isEmpty } from 'lodash'

import cx from 'classnames'
import { Nullable } from 'uiSrc/utils'
import validationErrors from 'uiSrc/constants/validationErrors'
import UploadFile from 'uiSrc/components/uploadFile'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (data: any) => void
  onCancel: () => void
}

interface FormValues {
  file: Nullable<File>
  name: string
}

const UploadTutorialForm = (props: Props) => {
  const { onSubmit, onCancel } = props
  const [errors, setErrors] = useState<FormikErrors<FormValues>>({})

  const initialValues: FormValues = {
    file: null,
    name: ''
  }

  const isSubmitDisabled = !isEmpty(errors)

  const validate = (values: FormValues) => {
    const errs: FormikErrors<FormValues> = {}

    if (!values.name) errs.name = 'Tutorial Name'
    if (!values.file) errs.file = 'Tutorial Archive'

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const getSubmitButtonContent = (isSubmitDisabled?: boolean) => {
    const maxErrorsCount = 5
    const errorsArr = Object.values(errors).map((err) => [
      err,
      <br key={err} />,
    ])

    if (errorsArr.length > maxErrorsCount) {
      errorsArr.splice(maxErrorsCount, errorsArr.length, ['...'])
    }
    return isSubmitDisabled ? (<span className="euiToolTip__content">{errorsArr}</span>) : null
  }

  const handleFileChange = async ({ target: { files } }: React.ChangeEvent<HTMLInputElement>) => {
    await formik.setFieldValue('file', files?.[0] ?? null)

    if (!formik.values.name) {
      await formik.setFieldValue('name', files?.[0]?.name ? files[0].name.replace(/(\.zip)$/, '') : '')
    }
  }

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.wrapper}>
        <EuiText>Add new Tutorial</EuiText>
        <EuiSpacer size="m" />
        <div>
          <EuiFieldText
            placeholder="Tutorial Name"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue('name', e.target.value)}
            className={styles.input}
          />
          {formik.values.file ? (
            <div className={styles.uploadFileName}>
              <EuiText className={cx(styles.uploadFileNameTitle)} color="subdued" size="xs">
                <div className="truncateText">
                  <span>{formik.values.file.name}</span>
                </div>
              </EuiText>
              <EuiButtonIcon
                style={{ marginLeft: '4px' }}
                size="xs"
                iconSize="s"
                iconType="trash"
                onClick={() => formik.setFieldValue('file', null)}
                aria-label="remove-file"
              />
            </div>
          ) : (
            <div className={styles.uploadFileWrapper}>
              <UploadFile onFileChange={handleFileChange} accept=".zip" />
            </div>
          )}
          <EuiSpacer size="l" />
          <div className={styles.footer}>
            <EuiButton color="secondary" size="s" onClick={() => onCancel()}>Cancel</EuiButton>
            <EuiToolTip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              title={
                isSubmitDisabled
                  ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
                  : null
              }
              content={getSubmitButtonContent(isSubmitDisabled)}
            >
              <EuiButton
                className={styles.btnSubmit}
                color="secondary"
                size="s"
                fill
                onClick={() => formik.handleSubmit()}
                iconType={isSubmitDisabled ? 'iInCircle' : undefined}
                disabled={isSubmitDisabled}
              >
                Submit
              </EuiButton>
            </EuiToolTip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadTutorialForm
