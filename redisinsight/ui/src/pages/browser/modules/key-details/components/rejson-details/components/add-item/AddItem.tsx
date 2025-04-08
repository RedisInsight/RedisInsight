import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiButtonIcon,
  EuiFieldText,
  EuiForm,
  EuiOutsideClickDetector,
  keys,
} from '@elastic/eui'

import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import { Nullable } from 'uiSrc/utils'
import { FlexItem } from 'uiSrc/components/base/layout/Flex'
import { WindowEvent } from 'uiSrc/components/base/utilities/WindowEvent'
import { FocusTrap } from 'uiSrc/components/base/utils/FocusTrap'
import { isValidJSON, isValidKey } from '../../utils'
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
      <EuiOutsideClickDetector onOutsideClick={onCancel}>
        <div>
          <WindowEvent event="keydown" handler={(e) => handleOnEsc(e)} />
          <FocusTrap>
            <EuiForm
              component="form"
              className="relative"
              onSubmit={(e) => handleFormSubmit(e)}
              style={{ display: 'flex' }}
              noValidate
            >
              {isPair && (
                <FlexItem grow inline>
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
                </FlexItem>
              )}
              <FlexItem grow inline>
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
              </FlexItem>
              <div className={cx(styles.controls)}>
                <EuiButtonIcon
                  iconSize="m"
                  iconType="cross"
                  color="primary"
                  aria-label="Cancel editing"
                  className={styles.declineBtn}
                  onClick={() => onCancel?.()}
                />
                <EuiButtonIcon
                  iconSize="m"
                  iconType="check"
                  color="primary"
                  type="submit"
                  aria-label="Apply"
                  className={styles.applyBtn}
                  data-testid="apply-btn"
                />
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
          </FocusTrap>
        </div>
      </EuiOutsideClickDetector>
    </div>
  )
}

export default AddItem
