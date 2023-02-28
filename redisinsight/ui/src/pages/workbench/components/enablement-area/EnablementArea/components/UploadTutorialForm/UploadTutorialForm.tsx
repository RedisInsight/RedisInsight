import React, { useState } from 'react'
import { EuiButton, EuiFieldText, EuiFilePicker, EuiSpacer, EuiText, EuiToolTip } from '@elastic/eui'
import { useFormik } from 'formik'
import { FormikErrors } from 'formik/dist/types'
import { isEmpty } from 'lodash'

import { Nullable } from 'uiSrc/utils'
import validationErrors from 'uiSrc/constants/validationErrors'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export interface FormValues {
  file: Nullable<File>
  name: string
  link: string
}

const UploadTutorialForm = (props: Props) => {
  const { onSubmit, onCancel } = props
  const [errors, setErrors] = useState<FormikErrors<FormValues>>({})

  const initialValues: FormValues = {
    file: null,
    name: '',
    link: ''
  }

  const isSubmitDisabled = !isEmpty(errors)

  const validate = (values: FormValues) => {
    const errs: FormikErrors<FormValues> = {}

    if (!values.name) errs.name = 'Tutorial Name'
    if (!values.file && !values.link) errs.file = 'Tutorial Archive or Link'

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

  const handleFileChange = async (files: FileList | null) => {
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
            placeholder="Tutorial Name*"
            value={formik.values.name}
            onChange={(e) => formik.setFieldValue('name', e.target.value)}
            className={styles.input}
          />
          <div className={styles.uploadFileWrapper}>
            <EuiFilePicker
              id="import-tutorial"
              initialPromptText="Select or drop a file"
              className={styles.fileDrop}
              onChange={handleFileChange}
              display="large"
              accept=".zip"
              data-testid="import-tutorial"
              aria-label="Select or drop file"
            />
          </div>
          <div className={styles.hr}>OR</div>
          <EuiFieldText
            placeholder="Tutorial Link"
            value={formik.values.link}
            onChange={(e) => formik.setFieldValue('link', e.target.value)}
            className={styles.input}
          />
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
