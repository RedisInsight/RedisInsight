import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiTextArea, EuiToolTip, keys } from '@elastic/eui'

import cx from 'classnames'
import { isModifiedEvent } from 'uiSrc/services'

import SendIcon from 'uiSrc/assets/img/icons/send.svg?react'

import styles from './styles.module.scss'

export interface Props {
  validation?: {
    title?: React.ReactNode
    content?: React.ReactNode
  }
  isDisabled?: boolean
  placeholder?: string
  onSubmit: (value: string) => void
}

const INDENT_TEXTAREA_SPACE = 2

const ChatForm = (props: Props) => {
  const {
    validation,
    isDisabled,
    placeholder,
    onSubmit
  } = props
  const [value, setValue] = useState('')
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
      submitMessage()
    }
  }

  const handleChange = ({ target }: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(target.value)
    updateTextAreaHeight()
  }

  const handleSubmitForm = (e: React.MouseEvent<HTMLFormElement>) => {
    e?.preventDefault()
    submitMessage()
  }

  const submitMessage = () => {
    if (!value || isDisabled) return

    onSubmit?.(value)
    setValue('')
    updateTextAreaHeight(true)
  }

  return (
    <EuiToolTip
      title={validation?.title}
      content={validation?.content}
      anchorClassName={styles.validationTooltip}
      display="block"
    >
      <EuiForm
        className={cx(styles.wrapper, { [styles.isFormDisabled]: validation })}
        component="form"
        onSubmit={handleSubmitForm}
        onKeyDown={handleKeyDown}
      >
        <EuiTextArea
          inputRef={textAreaRef}
          placeholder={placeholder || 'Ask me about Redis'}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          disabled={!!validation}
          data-testid="ai-message-textarea"
        />
        <EuiButton
          fill
          size="s"
          color="secondary"
          disabled={!value.length || isDisabled}
          className={styles.submitBtn}
          iconType={SendIcon}
          type="submit"
          aria-label="submit"
          data-testid="ai-submit-message-btn"
        />
      </EuiForm>
    </EuiToolTip>
  )
}

export default React.memo(ChatForm)
