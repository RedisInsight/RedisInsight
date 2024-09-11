import React, { Ref, useRef, useState } from 'react'
import { EuiButton, EuiForm, EuiIcon, EuiPopover, EuiSpacer, EuiText, EuiTextArea, EuiTitle, EuiToolTip, keys } from '@elastic/eui'

import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { isModifiedEvent } from 'uiSrc/services'

import SendIcon from 'uiSrc/assets/img/icons/send.svg?react'

import { Nullable, isRedisearchAvailable } from 'uiSrc/utils'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'
import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg?react'
import { createAiAgreementAction } from 'uiSrc/slices/panels/aiAssistant'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { BotType } from 'uiSrc/slices/interfaces/aiAssistant'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { ASSISTANCE_CHAT_AGREEMENTS, EXPERT_CHAT_AGREEMENTS } from '../../texts'
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
  modules: AdditionalRedisModule[]
  isAgreementAccepted: (dbId: Nullable<string>) => boolean
}

const INDENT_TEXTAREA_SPACE = 2

const ChatForm = (props: Props) => {
  const {
    isDisabled,
    onSubmit,
    dbId,
    modules,
    isAgreementAccepted,
  } = props
  const [value, setValue] = useState('')
  const [validation, setValidation] = useState<Nullable<IValidation>>(null)
  const [isAgreementsPopoverOpen, setIsAgreementsPopoverOpen] = useState(false)
  const [agreement, setAgreement] = useState<any>(null)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)
  const freeInstances = useSelector(freeInstancesSelector) || []

  const dispatch = useDispatch()

  const getValidationMessage = (message?: string) => {
    if (!message || !(message && message.trim().startsWith('/query'))) {
      // set validation to null
      if (validation) setValidation(null)
      return
    }
    if (!dbId) {
      setValidation({
        title: 'Open a database',
        content: 'Open your Redis database with search & query, or create a new database to get started.'
      })
      return
    }

    if (!isRedisearchAvailable(modules)) {
      setValidation({
        title: 'Search & query capability is not available',
        content: freeInstances?.length
          ? 'Use your free all-in-one Redis Cloud database to start exploring these capabilities.'
          : 'Create a free Redis Stack database with search & query capability that extends the core capabilities of open-source Redis.',
        icon: (
          <EuiIcon
            className={styles.iconTelescope}
            type={TelescopeImg}
          />
        )
      })
      return
    }
    validation && setValidation(null)
  }

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
    getValidationMessage(target.value)
  }

  const handleSubmitForm = (e: React.MouseEvent<HTMLFormElement>) => {
    e?.preventDefault()
    handleSubmitMessage()
  }

  const showAgreement = (dbId: Nullable<string>) => {
    const newAgreement = dbId ? EXPERT_CHAT_AGREEMENTS : ASSISTANCE_CHAT_AGREEMENTS
    setAgreement(newAgreement)
    setIsAgreementsPopoverOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
      eventData: {
        chat: dbId ? BotType.Query : BotType.General,
      }
    })
  }

  const handleSubmitMessage = () => {
    if (!value || isDisabled) return

    const dbAiAgreementId = value.trim().startsWith('/query') ? dbId : null
    if (!isAgreementAccepted(dbAiAgreementId)) {
      showAgreement(dbAiAgreementId)
      return
    }
    submitMessage()
  }

  const acceptAiAgreement = (dbId: Nullable<string>) => {
    dispatch(createAiAgreementAction(dbId))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
      eventData: {
        databaseId: dbId || undefined,
        chat: dbId ? BotType.Query : BotType.General,
      }
    })
  }

  const submitMessage = () => {
    if (isAgreementsPopoverOpen) {
      // createe needed ai agreements
      const dbAiAgreementId = value.trim().startsWith('/query') ? dbId : null
      if (dbAiAgreementId && !isAgreementAccepted(null)) {
        acceptAiAgreement(null)
      }
      acceptAiAgreement(dbAiAgreementId)
      setAgreement(null)
      setIsAgreementsPopoverOpen(false)
    }

    onSubmit?.(value)
    const newValue = value.trim().startsWith('/query') ? '/query ' : ''
    setValue(newValue)
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
          className={cx(styles.wrapper, {
            // [styles.isFormDisabled]: validation
          })}
          component="form"
          onSubmit={handleSubmitForm}
          onKeyDown={handleKeyDown}
        >
          <EuiTextArea
            inputRef={textAreaRef}
            placeholder="Message Redis AI Assistant..."
            className={styles.textarea}
            value={value}
            onChange={handleChange}
            // disabled={!!validation}
            data-testid="ai-message-textarea"
          />
          <EuiPopover
            ownFocus
            initialFocus={false}
            isOpen={isAgreementsPopoverOpen}
            anchorPosition="downRight"
            closePopover={() => {
              setAgreement(null)
              setIsAgreementsPopoverOpen(false)
            }}
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
              {agreement}
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
