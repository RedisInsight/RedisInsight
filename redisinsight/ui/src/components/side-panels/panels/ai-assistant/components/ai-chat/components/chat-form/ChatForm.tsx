import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiText, EuiTextArea, EuiToolTip, keys } from '@elastic/eui'

import cx from 'classnames'
import { isModifiedEvent } from 'uiSrc/services'

import SendIcon from 'uiSrc/assets/img/icons/send.svg?react'
import { Maybe, Nullable } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface IValidation {
  title?: React.ReactNode
  content?: React.ReactNode
  icon?: React.ReactNode
}

export interface Props {
  isDisabled?: boolean
  onSubmit: (value: string) => void
  databaseId: Nullable<string>
  isGeneralAgreementAccepted: Maybe<boolean>
}

const INDENT_TEXTAREA_SPACE = 2

const ChatForm = (props: Props) => {
  const {
    isDisabled,
    onSubmit,
    databaseId,
    isGeneralAgreementAccepted,
  } = props
  const [value, setValue] = useState('')
  const [validation, setValidation] = useState<Nullable<string>>(null)
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

    if (!databaseId && value.trim().startsWith('/query')) {
      setValidation('Open your Redis database with Redis Query Engine , or create a new database to get started.')
    } else if (validation) setValidation(null)
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
        title={!isGeneralAgreementAccepted ? 'Accept the Redis Copilot General terms' : null}
        content={!isGeneralAgreementAccepted ? 'Accept the Redis Copilot General terms in the menu above to get started.'
          : validation}
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
              iconType={SendIcon}
              color="secondary"
              className={styles.submitBtn}
              aria-label="submit"
              type="submit"
              disabled={!value.length || isDisabled || !!validation}
              isDisabled={!value.length || isDisabled || !!validation}
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
