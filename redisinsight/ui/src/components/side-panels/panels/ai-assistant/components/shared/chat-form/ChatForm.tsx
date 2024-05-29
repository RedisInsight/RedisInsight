import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiPopover, EuiSpacer, EuiText, EuiTextArea, EuiTitle, EuiToolTip, keys } from '@elastic/eui'

import cx from 'classnames'
import { isModifiedEvent } from 'uiSrc/services'

import SendIcon from 'uiSrc/assets/img/icons/send.svg?react'

import styles from './styles.module.scss'

export interface Props {
  validation?: {
    title?: React.ReactNode
    content?: React.ReactNode
    icon?: React.ReactNode
  }
  agreements?: React.ReactNode
  onAgreementsDisplayed?: () => void
  isDisabled?: boolean
  placeholder?: string
  onSubmit: (value: string) => void
}

const INDENT_TEXTAREA_SPACE = 2

const ChatForm = (props: Props) => {
  const {
    validation,
    agreements,
    onAgreementsDisplayed,
    isDisabled,
    placeholder,
    onSubmit
  } = props
  const [value, setValue] = useState('')
  const [isAgreementsPopoverOpen, setIsAgreementsPopoverOpen] = useState(false)
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
  }

  const handleSubmitForm = (e: React.MouseEvent<HTMLFormElement>) => {
    e?.preventDefault()
    handleSubmitMessage()
  }

  const handleSubmitMessage = () => {
    if (!value || isDisabled) return

    if (agreements) {
      setIsAgreementsPopoverOpen(true)
      onAgreementsDisplayed?.()
      return
    }

    submitMessage()
  }

  const submitMessage = () => {
    setIsAgreementsPopoverOpen(false)

    onSubmit?.(value)
    setValue('')
    updateTextAreaHeight(true)
  }

  return (
    <div>
      <EuiToolTip
        content={validation ? (
          <div className={styles.tooltipContent}>
            <div>
              {validation.title && (
                <>
                  <EuiTitle size="xxs"><span>{validation.title}</span></EuiTitle>
                  <EuiSpacer size="s" />
                </>
              )}
              {validation.content && (<EuiText size="xs">{validation.content}</EuiText>)}
            </div>
            {validation.icon}
          </div>
        ) : undefined}
        className={styles.validationTooltip}
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
          <EuiPopover
            ownFocus
            initialFocus={false}
            isOpen={isAgreementsPopoverOpen}
            anchorPosition="downRight"
            closePopover={() => setIsAgreementsPopoverOpen(false)}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            button={(
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
            )}
          >
            <>
              {agreements}
              <EuiSpacer size="m" />
              <EuiButton
                fill
                color="secondary"
                size="s"
                className={styles.agreementsAccept}
                onClick={submitMessage}
                onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                type="button"
                data-testid="ai-accept-agreements"
              >
                I accept
              </EuiButton>
            </>
          </EuiPopover>
        </EuiForm>
      </EuiToolTip>
      <EuiText textAlign="center" size="xs" className={styles.agreementText}>
        Verify the accuracy of any information provided by Redis Copilot before using it
      </EuiText>
    </div>

  )
}

export default React.memo(ChatForm)
