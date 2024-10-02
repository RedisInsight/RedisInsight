import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiText, EuiTextArea, EuiToolTip, keys } from '@elastic/eui'

import cx from 'classnames'
import { isModifiedEvent } from 'uiSrc/services'

import SendIcon from 'uiSrc/assets/img/icons/send.svg?react'
import { Nullable } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface IValidation {
  title?: React.ReactNode
  content?: React.ReactNode
  icon?: React.ReactNode
}

export interface Props {
  isDisabled?: boolean
  onSubmit: (value: string) => void
  dbId: Nullable<string>
  isGeneralAgreementAccepted: boolean
}

const INDENT_TEXTAREA_SPACE = 2

const ChatForm = (props: Props) => {
  const {
    isDisabled,
    onSubmit,
    dbId,
    isGeneralAgreementAccepted,
  } = props
  const [value, setValue] = useState('')
  const [validation, setValidation] = useState(false)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const updateTextAreaHeight = (initialState = false) => {
    if (!textAreaRef.current) return

    textAreaRef.current.style.height = '0px'

    if (initialState) return

    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight + INDENT_TEXTAREA_SPACE}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isModifiedEvent(e)) return

    if (e.key === keys.ENTER) {
      e.preventDefault()
      handleSubmitMessage()
    }
  }

  const handleChange = ({ target }: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(target.value)
    updateTextAreaHeight()

    if (!dbId && value.trim().startsWith('/query')) {
      setValidation(true)
    } else if (validation) setValidation(false)
  }

  const handleSubmitForm = (e: React.MouseEvent<HTMLFormElement>) => {
    e?.preventDefault()
    handleSubmitMessage()
  }

  const handleSubmitMessage = () => {
    if (!value || isDisabled) return

    submitMessage()
  }

  const submitMessage = () => {
    onSubmit?.(value)
    setValue('')
    updateTextAreaHeight(true)
  }

  return (
    <div>
      <EuiToolTip
        title={isGeneralAgreementAccepted ? null : 'Accept the Redis Copilot General terms'}
        content={!isGeneralAgreementAccepted ? 'Accept the Redis Copilot General terms in the menu above to get started.'
          : validation ? 'Open your Redis database with Redis Query Engine , or create a new database to get started.'
            : null}
        className={styles.validationTooltip}
        display="block"
      >
        <EuiForm
          className={cx(styles.wrapper, {
            [styles.isFormDisabled]: !isGeneralAgreementAccepted
          })}
          component="form"
          onSubmit={handleSubmitForm}
          onKeyDown={handleKeyDown}
        >
          <EuiTextArea
            inputRef={textAreaRef}
            placeholder="Ask me about Redis or let me generate a query"
            className={styles.textarea}
            value={value}
            onChange={handleChange}
            disabled={!isGeneralAgreementAccepted}
            data-testid="ai-message-textarea"
          />
          <div className={styles.submitBtnWrapper}>
            <EuiButton
              fill
              size="s"
              color="secondary"
              disabled={!value.length || isDisabled || validation}
              isDisabled={!value.length || isDisabled || validation}
              className={styles.submitBtn}
              iconType={SendIcon}
              type="submit"
              aria-label="submit"
              data-testid="ai-submit-message-btn"
            />
          </div>
        </EuiForm>
      </EuiToolTip>
      <EuiText textAlign="center" size="xs" className={styles.agreementText}>
        Verify the accuracy of any information provided by Redis Copilot before using it
      </EuiText>
    </div>

  )
}

export default React.memo(ChatForm)
