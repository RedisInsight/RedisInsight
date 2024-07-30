import { EuiToolTip } from '@elastic/eui'
import { FormikErrors } from 'formik'
import React from 'react'

import validationErrors from 'uiSrc/constants/validationErrors'
import { ConnectionFormValues } from '../ConnectionForm'

export interface Props {
  isValid: boolean
  errors: FormikErrors<ConnectionFormValues>
  children: React.ReactElement
}

const ValidationTooltip = ({ isValid, errors, children }: Props) => {
  const tooltipContent = (
    <ul>
      {Object.values(errors).map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  )

  return (
    <EuiToolTip
      data-testid="connection-form-validation-tooltip"
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={!isValid ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length) : null}
      content={!isValid ? tooltipContent : null}
    >
      {children}
    </EuiToolTip>
  )
}

export default ValidationTooltip
