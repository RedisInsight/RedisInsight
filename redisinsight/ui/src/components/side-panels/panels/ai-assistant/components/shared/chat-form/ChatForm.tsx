import React, { Ref, useRef, useState } from 'react'
import {
  EuiForm,
  EuiPopover,
  EuiTitle,
  EuiToolTip,
  keys,
} from '@elastic/eui'

import cx from 'classnames'
import { isModifiedEvent } from 'uiSrc/services'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { SendIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { TextArea } from 'uiSrc/components/base/inputs'
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
    onSubmit,
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

  const handleChange = (value: string) => {
    setValue(value)
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
        content={
          validation ? (
            <div className={styles.tooltipContent}>
              <div>
                {validation.title && (
                  <>
                    <EuiTitle size="xxs">
                      <span>{validation.title}</span>
                    </EuiTitle>
                    <Spacer size="s" />
                  </>
                )}
                {validation.content && (
                  <Text size="xs">{validation.content}</Text>
                )}
              </div>
              {validation.icon}
            </div>
          ) : undefined
        }
        className={styles.validationTooltip}
        display="block"
      >
        <EuiForm
          className={cx(styles.wrapper, {
            [styles.isFormDisabled]: validation,
          })}
          component="form"
          onSubmit={handleSubmitForm}
          onKeyDown={handleKeyDown}
        >
          <TextArea
            ref={textAreaRef}
            placeholder={placeholder || 'Ask me about Redis'}
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
            panelClassName={cx(
              'euiToolTip',
              'popoverLikeTooltip',
              styles.popover,
            )}
            anchorClassName={styles.popoverAnchor}
            button={
              <PrimaryButton
                size="s"
                disabled={!value.length || isDisabled}
                className={styles.submitBtn}
                icon={SendIcon}
                type="submit"
                aria-label="submit"
                data-testid="ai-submit-message-btn"
              />
            }
          >
            <>
              {agreements}
              <Spacer size="m" />
              <PrimaryButton
                size="s"
                className={styles.agreementsAccept}
                onClick={submitMessage}
                onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                type="button"
                data-testid="ai-accept-agreements"
              >
                I accept
              </PrimaryButton>
            </>
          </EuiPopover>
        </EuiForm>
      </EuiToolTip>
      <Text textAlign="center" size="xs" className={styles.agreementText}>
        Verify the accuracy of any information provided by Redis Copilot before
        using it
      </Text>
    </div>
  )
}

export default React.memo(ChatForm)
