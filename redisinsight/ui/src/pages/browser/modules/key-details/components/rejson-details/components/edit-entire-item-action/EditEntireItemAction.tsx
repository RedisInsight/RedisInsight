import React, { ChangeEvent, useState } from 'react'
import {
  EuiButtonIcon,
  EuiForm,
  EuiTextArea,
  keys,
} from '@elastic/eui'
import cx from 'classnames'

import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { Nullable } from 'uiSrc/utils'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { isValidJSON } from '../../utils'
import { JSONErrors } from '../../constants'

import styles from '../../styles.module.scss'

export interface Props {
  initialValue: string
  onCancel?: () => void
  onSubmit: (value: string) => void
}

const EditEntireItemAction = (props: Props) => {
  const { initialValue, onCancel, onSubmit } = props
  const [value, setValue] = useState<string>(initialValue)
  const [error, setError] = useState<Nullable<string>>(null)

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.code?.toLowerCase() === keys.ESCAPE) {
      e.stopPropagation()
      onCancel?.()
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      return
    }

    onSubmit(value)
  }

  return (
    <div className={styles.row}>
      <div className={styles.fullWidthContainer}>
        <OutsideClickDetector onOutsideClick={() => onCancel?.()}>
          <div>
            <WindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
            <FocusTrap>
              <EuiForm
                component="form"
                className="relative"
                onSubmit={handleFormSubmit}
                data-testid="json-entire-form"
                noValidate
              >
                <FlexItem grow inline>
                  <EuiTextArea
                    isInvalid={!!error}
                    className={styles.fullWidthTextArea}
                    value={value}
                    placeholder="Enter JSON value"
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setValue(e.target.value)
                    }
                    data-testid="json-value"
                  />
                </FlexItem>
                <div className={cx(styles.controls, styles.controlsBottom)}>
                  <EuiButtonIcon
                    iconSize="m"
                    iconType="cross"
                    color="primary"
                    aria-label="Cancel add"
                    className={styles.declineBtn}
                    onClick={onCancel}
                    data-testid="cancel-edit-btn"
                  />
                  <EuiButtonIcon
                    iconSize="m"
                    iconType="check"
                    color="primary"
                    type="submit"
                    aria-label="Apply"
                    className={styles.applyBtn}
                    data-testid="apply-edit-btn"
                  />
                </div>
              </EuiForm>
              {error && (
                <div
                  className={cx(
                    styles.errorMessage,
                    styles.errorMessageForTextArea,
                  )}
                >
                  <FieldMessage
                    scrollViewOnAppear
                    icon="alert"
                    testID="edit-json-error"
                  >
                    {error}
                  </FieldMessage>
                </div>
              )}
            </FocusTrap>
          </div>
        </OutsideClickDetector>
      </div>
    </div>
  )
}

export default EditEntireItemAction
