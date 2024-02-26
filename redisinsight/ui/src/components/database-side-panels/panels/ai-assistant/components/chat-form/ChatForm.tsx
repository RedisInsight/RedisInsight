import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiTextArea, keys } from '@elastic/eui'

import { ReactComponent as SendIcon } from 'uiSrc/assets/img/icons/send.svg'

import styles from './styles.module.scss'

export interface Props {
  onSubmit: (value: string) => void
}

const ChatForm = (props: Props) => {
  const { onSubmit } = props
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
    if (!value) return

    onSubmit?.(value)
    setValue('')
    updateTextAreaHeight(true)
  }

  return (
    <EuiForm className={styles.wrapper} component="form" onSubmit={handleSubmitForm} onKeyDown={handleKeyDown}>
      <EuiTextArea
        inputRef={textAreaRef}
        placeholder="Message Redis AI Assistant"
        className={styles.textarea}
        value={value}
        onChange={handleChange}
      />
      <EuiButton
        fill
        size="s"
        color="secondary"
        disabled={!value.length}
        className={styles.submitBtn}
        iconType={SendIcon}
        type="submit"
        aria-label="submit"
      />
    </EuiForm>
  )
}

export default ChatForm
