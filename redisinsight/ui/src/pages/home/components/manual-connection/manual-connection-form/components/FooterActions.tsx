import React from 'react'
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiToolTip } from '@elastic/eui'
import { FormikErrors } from 'formik'
import validationErrors from 'uiSrc/constants/validationErrors'
import { getSubmitButtonContent } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/pages/home/interfaces'
import { SubmitBtnText } from 'uiSrc/pages/home/constants'

export interface Props {
  submitIsDisable: () => boolean
  errors: FormikErrors<DbConnectionInfo>
  isLoading?: boolean
  onClickTestConnection: () => void
  onClose?: () => void
  onClickSubmit: () => void
  submitButtonText?: SubmitBtnText
}

const FooterActions = (props: Props) => {
  const {
    isLoading,
    submitButtonText,
    submitIsDisable,
    errors,
    onClickTestConnection,
    onClose,
    onClickSubmit
  } = props

  const SubmitButton = ({
    text = '',
    onClick,
    submitIsDisabled,
  }: ISubmitButton) => (
    <EuiToolTip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        submitIsDisabled
          ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
          : null
      }
      content={getSubmitButtonContent(errors, submitIsDisabled)}
    >
      <EuiButton
        fill
        size="s"
        color="secondary"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        isLoading={isLoading}
        iconType={submitIsDisabled ? 'iInCircle' : undefined}
        data-testid="btn-submit"
      >
        {text}
      </EuiButton>
    </EuiToolTip>
  )

  return (
    <EuiFlexGroup
      justifyContent="spaceBetween"
      alignItems="center"
      gutterSize="none"
      responsive={false}
    >
      <EuiFlexItem className="btn-back" grow={false}>
        <EuiToolTip
          position="top"
          anchorClassName="euiToolTip__btn-disabled"
          title={
            submitIsDisable()
              ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
              : null
          }
          content={getSubmitButtonContent(errors, submitIsDisable())}
        >
          <EuiButtonEmpty
            size="s"
            className="empty-btn"
            onClick={onClickTestConnection}
            disabled={submitIsDisable()}
            isLoading={isLoading}
            iconType={submitIsDisable() ? 'iInCircle' : undefined}
            data-testid="btn-test-connection"
          >
            Test Connection
          </EuiButtonEmpty>
        </EuiToolTip>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFlexGroup responsive={false} gutterSize="none">
          {onClose && (
            <EuiButton
              size="s"
              onClick={onClose}
              color="secondary"
              className="btn-cancel"
              data-testid="btn-cancel"
              style={{ marginRight: 12 }}
            >
              Cancel
            </EuiButton>
          )}
          <SubmitButton
            onClick={onClickSubmit}
            text={submitButtonText}
            submitIsDisabled={submitIsDisable()}
          />
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default FooterActions
