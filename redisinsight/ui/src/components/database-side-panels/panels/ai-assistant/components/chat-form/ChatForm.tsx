import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiTextArea, EuiToolTip, keys } from '@elastic/eui'

import { ReactComponent as SendIcon } from 'uiSrc/assets/img/icons/send.svg'

import { Maybe } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  validationMessage?: Maybe<string>
  isDisabled?: boolean
  placeholder?: string
  onSubmit: (value: string) => void
}

const ChatForm = (props: Props) => {
  const { validationMessage, isDisabled, placeholder, onSubmit } = props
  const [value, setValue] = useState('')
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const updateTextAreaHeight = (initialState = false) => {
    if (!textAreaRef.current) return

    textAreaRef.current.style.height = '0px'

    if (initialState) return

    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight || 0}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === keys.ENTER && (e.metaKey || e.ctrlKey)) {
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
    <EuiForm className={styles.wrapper} component="form" onSubmit={handleSubmitForm} onKeyDown={handleKeyDown}>
      <EuiTextArea
        inputRef={textAreaRef}
        placeholder={placeholder || 'Ask me about Redis'}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
      />
      <EuiToolTip
        content={validationMessage}
        anchorClassName={styles.submitBtnTooltip}
      >
        <EuiButton
          fill
          size="s"
          color="secondary"
          disabled={!value.length || isDisabled}
          className={styles.submitBtn}
          iconType={SendIcon}
          type="submit"
          aria-label="submit"
        />
      </EuiToolTip>

    </EuiForm>
  )
}

export default ChatForm
