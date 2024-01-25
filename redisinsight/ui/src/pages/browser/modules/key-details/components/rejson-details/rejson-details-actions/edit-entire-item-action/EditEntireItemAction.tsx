import React, { ChangeEvent, FormEvent } from 'react'
import {
  EuiButtonIcon,
  EuiFlexItem,
  EuiFocusTrap,
  EuiForm,
  EuiOutsideClickDetector,
  EuiTextArea,
  EuiWindowEvent
} from '@elastic/eui'
import cx from 'classnames'

import FieldMessage from 'uiSrc/components/field-message/FieldMessage'
import styles from '../../styles.module.scss'

export interface Props {
  handleOnEsc: (e: KeyboardEvent, type: string) => void
  handleUpdateValueFormSubmit: (e: FormEvent<HTMLFormElement>) => void
  setValueOfEntireItem: (value: any) => void
  setEditEntireItem: (value: boolean) => void
  setError: (error: string | null) => void
  error: string | null
  valueOfEntireItem: string | null
}

const EditEntireItemAction = ({
  handleOnEsc,
  handleUpdateValueFormSubmit,
  error,
  valueOfEntireItem,
  setValueOfEntireItem,
  setEditEntireItem,
  setError
}: Props) => (
  <div className={styles.row}>
    <div className={styles.fullWidthContainer}>
      <EuiOutsideClickDetector onOutsideClick={() => {
        setError(null)
        setEditEntireItem(false)
      }}
      >
        <div style={{ marginBottom: '34px' }}>
          <EuiWindowEvent event="keydown" handler={(e) => handleOnEsc(e, 'edit')} />
          <EuiFocusTrap>
            <EuiForm
              component="form"
              className="relative"
              onSubmit={(e) => handleUpdateValueFormSubmit(e)}
              data-testid="json-entire-form"
              noValidate
            >
              <EuiFlexItem grow component="span">
                <EuiTextArea
                  isInvalid={!!error}
                  className={styles.fullWidthTextArea}
                  value={valueOfEntireItem ? valueOfEntireItem.toString() : ''}
                  placeholder="Enter JSON value"
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setValueOfEntireItem(event.target.value)}
                  data-testid="json-value"
                />
              </EuiFlexItem>
              <div className={cx(styles.controls, styles.controlsBottom)}>
                <EuiButtonIcon
                  iconSize="m"
                  iconType="cross"
                  color="primary"
                  aria-label="Cancel add"
                  className={styles.declineBtn}
                  onClick={() => {
                    setError(null)
                    setEditEntireItem(false)
                  }}
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
              <div className={cx(styles.errorMessage, styles.errorMessageForTextArea)}>
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
  </div>
)

export { EditEntireItemAction }
