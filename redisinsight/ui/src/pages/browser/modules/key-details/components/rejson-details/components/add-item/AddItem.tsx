import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexItem,
  EuiFocusTrap,
  EuiForm,
  EuiOutsideClickDetector,
  EuiPopover,
  EuiText,
  EuiWindowEvent,
  keys,
} from '@elastic/eui'
import { useSelector } from 'react-redux'

import { rejsonDataSelector } from 'uiSrc/slices/browser/rejson'
import { checkExistingPath } from 'uiSrc/utils/rejson'
import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { Nullable } from 'uiSrc/utils'
import { isValidJSON, isValidKey, parseJsonData, wrapPath } from '../../utils'
import { JSONErrors } from '../../constants'

import styles from '../../styles.module.scss'

export interface Props {
  isPair: boolean
  onCancel: () => void
  onSubmit: (pair: { key?: string; value: string }) => void
  leftPadding?: number
}

const AddItem = (props: Props) => {
  const { isPair, leftPadding = 0, onCancel, onSubmit } = props
  const [isConfirmationVisible, setIsConfirmationVisible] =
    useState<boolean>(false)

  const { data } = useSelector(rejsonDataSelector)
  const jsonContent = parseJsonData(data)

  const [key, setKey] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [error, setError] = useState<Nullable<string>>(null)

  useEffect(() => {
    setError(null)
  }, [key, value])

  const handleOnEsc = (e: KeyboardEvent) => {
    if (e.code?.toLowerCase() === keys.ESCAPE) {
      e.stopPropagation()
      onCancel?.()
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isPair && !isValidKey(key)) {
      setError(JSONErrors.keyCorrectSyntax)
      return
    }

    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      return
    }

    const wrappedKey = wrapPath(key) || ''
    if (checkExistingPath(wrappedKey, jsonContent)) {
      setIsConfirmationVisible(true)
      return
    }

    onSubmit({ key, value })
  }

  const confirmApply = () => {
    onSubmit({ key, value })
  }

  return (
    <div
      className={styles.row}
      style={{
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: `${leftPadding}em`,
      }}
    >
      <EuiOutsideClickDetector onOutsideClick={() => {}}>
        <div>
          <EuiWindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
          <EuiFocusTrap>
            <EuiForm
              component="form"
              className="relative"
              onSubmit={(e) => handleFormSubmit(e)}
              style={{ display: 'flex' }}
              noValidate
            >
              {isPair && (
                <EuiFlexItem grow component="span">
                  <EuiFieldText
                    name="newRootKey"
                    value={key}
                    isInvalid={!!error}
                    placeholder="Enter JSON key"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setKey(e.target.value)
                    }
                    data-testid="json-key"
                  />
                </EuiFlexItem>
              )}
              <EuiFlexItem grow component="span">
                <EuiFieldText
                  name="newValue"
                  value={value}
                  placeholder="Enter JSON value"
                  isInvalid={!!error}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValue(e.target.value)
                  }
                  data-testid="json-value"
                />
              </EuiFlexItem>
              <div className={cx(styles.controls)}>
                <EuiButtonIcon
                  iconSize="m"
                  iconType="cross"
                  color="primary"
                  aria-label="Cancel editing"
                  className={styles.declineBtn}
                  onClick={() => onCancel?.()}
                />

                <EuiPopover
                  ownFocus
                  initialFocus={false}
                  anchorPosition="downRight"
                  isOpen={isConfirmationVisible}
                  closePopover={() => {}}
                  panelClassName={cx(
                    'euiToolTip',
                    'popoverLikeTooltip',
                    styles.popover,
                  )}
                  button={
                    <EuiButtonIcon
                      iconSize="m"
                      iconType="check"
                      color="primary"
                      type="submit"
                      aria-label="Apply"
                      className={styles.applyBtn}
                      data-testid="apply-btn"
                    />
                  }
                >
                  <EuiText size="m" style={{ fontWeight: 'bold' }}>
                    Duplicate JSON key detected
                  </EuiText>
                  <EuiText size="s">
                    You already have the same JSON key. If you proceed, a value
                    of the existing JSON key will be overwritten.
                  </EuiText>

                  <div className={styles.confirmDialogActions}>
                    <EuiButton
                      color="secondary"
                      aria-label="Cancel"
                      size="s"
                      className={cx(styles.btn)}
                      onClick={onCancel}
                      data-testid="cancel-confirmation-btn"
                    >
                      Cancel
                    </EuiButton>

                    <EuiButton
                      fill
                      color="warning"
                      aria-label="Save"
                      size="s"
                      className={cx(styles.btn, styles.saveBtn)}
                      onClick={confirmApply}
                      data-testid="save-btn"
                    >
                      Save
                    </EuiButton>
                  </div>
                </EuiPopover>
              </div>
            </EuiForm>
            {!!error && (
              <div className={cx(styles.errorMessage)}>
                <FieldMessage
                  scrollViewOnAppear
                  icon="alert"
                  testID="edit-json-error"
                >
                  {error}
                </FieldMessage>
              </div>
            )}
          </EuiFocusTrap>
        </div>
      </EuiOutsideClickDetector>
    </div>
  )
}

export default AddItem
