import React, { useEffect, useMemo, useState } from 'react'
import { EuiButton, EuiButtonIcon, EuiCheckbox, EuiFlexGroup, EuiFlexItem, EuiForm, EuiIcon, EuiLink, EuiPopover, EuiSpacer, EuiSwitch, EuiText, EuiTitle, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import { useDispatch } from 'react-redux'
import { useFormik } from 'formik'
import AgreementIcon from 'uiSrc/assets/img/ai/Settings.svg?react'
import Divider from 'uiSrc/components/divider/Divider'
import WarningIcon from 'uiSrc/assets/img/ai/Info.svg'
import { AiAgreement, AiDatabaseAgreement } from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable } from 'uiSrc/utils'
import { updateAiAgreementsAction } from 'uiSrc/slices/panels/aiAssistant'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { createDatabaseAgreementFunc, createGeneralAgreementFunc } from 'uiSrc/utils/api'
import styles from './styles.module.scss'

interface InitialValues {
  checkGeneralAgreement: boolean
  checkDbAgreement: boolean
  showWarningMessage: boolean
}

export interface Props {
  databaseId: Nullable<string>
  generalAgreement: Nullable<AiAgreement>
  databaseAgreement: Nullable<AiDatabaseAgreement>
  onRestart: () => void
  settingsOpenedByDefault: boolean
}

const CopilotSettingsPopover = ({
  databaseId,
  generalAgreement,
  databaseAgreement,
  onRestart,
  settingsOpenedByDefault,
}: Props) => {
  const [agreementsPopoverOpen, setAgreementsPopoverOpen] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (settingsOpenedByDefault) triggerPopover(true)
  }, [settingsOpenedByDefault])

  const triggerPopover = (value: boolean) => {
    if (value) {
      sendEventTelemetry({
        event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
        eventData: {
          databaseId: databaseId || undefined,
        } })
    }
    setAgreementsPopoverOpen(value)
  }

  const getInitialValues = useMemo(() => ({
    checkGeneralAgreement: !!generalAgreement?.consent,
    checkDbAgreement: !!databaseAgreement?.dataConsent,
    showWarningMessage: false,
  }), [generalAgreement, databaseAgreement])

  const formik = useFormik({
    initialValues: getInitialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    }
  })

  const submitForm = async (values: InitialValues) => {
    const promises = []

    if (!!generalAgreement?.consent !== values.checkGeneralAgreement) {
      promises.push(createGeneralAgreementFunc({ consent: values.checkGeneralAgreement }))
    }

    if (databaseId && (!!databaseAgreement?.dataConsent !== values.checkDbAgreement)) {
      promises.push(createDatabaseAgreementFunc(databaseId, { dataConsent: values.checkDbAgreement }))
    }

    dispatch(updateAiAgreementsAction(promises, () => {
      if (values.showWarningMessage) onRestart?.()
      formik.setSubmitting(false)
      setAgreementsPopoverOpen(false)
    }, () => {
      formik.setSubmitting(false)
      setAgreementsPopoverOpen(false)
    }))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
      eventData: {
        databaseId: databaseId || undefined,
        generalAgreement: values.checkGeneralAgreement,
        databaseAgreement: values.checkDbAgreement,
      } })
  }

  const onAgreementIconClick = () => {
    const newAgreementPopoverOpen = !agreementsPopoverOpen
    triggerPopover(newAgreementPopoverOpen)
  }

  const toggleDbAgreement = (value: boolean) => {
    if (databaseAgreement?.dataConsent) formik.setFieldValue('showWarningMessage', !value)
    formik.setFieldValue('checkDbAgreement', value)
  }

  const onCancel = () => {
    formik.resetForm()
    setAgreementsPopoverOpen(false)
  }

  const labelStyle = (formik.values.checkDbAgreement ? styles.switchLabel : styles.switchLabelDisabled)

  return (
    <EuiPopover
      ownFocus={false}
      anchorPosition="downRight"
      isOpen={agreementsPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setAgreementsPopoverOpen(false)}
      panelClassName={styles.agreementsPopover}
      button={(
        <EuiButtonIcon
          size="s"
          iconType={AgreementIcon}
          iconSize="l"
          aria-label="Show agreements"
          onClick={onAgreementIconClick}
          data-testid="show-agreements-btn"
        />
    )}
    >
      <EuiForm component="form" onSubmit={formik.handleSubmit} data-testid="copilot-settings-form">
        <EuiTitle size="xs">
          <span>Copilot Settings</span>
        </EuiTitle>
        <EuiSpacer size="m" />
        <div className={styles.generalAgreementWrapper}>
          <EuiText className={styles.aiAgreementSubtitle} color="subdued">General terms</EuiText>
          <EuiSpacer size="m" />
          <EuiText className={styles.aiAgreementText} color="subdued">
            Redis Copilot is powered by OpenAI API.
          </EuiText>
          <EuiSpacer size="s" />
          <EuiText className={styles.aiAgreementText} color="subdued">
            By accessing and/or using Redis Copilot, you acknowledge that you agree to the
            {' '}
            <EuiLink
              color="subdued"
              external={false}
              target="_blank"
              href="https://redis.io/legal/redis-copilot-terms-of-use/"
            >
              REDIS COPILOT TERMS
            </EuiLink>
            {' '}
            and
            {' '}
            <EuiLink
              color="subdued"
              external={false}
              target="_blank"
              href="https://redis.com/legal/privacy-policy/"
            >
              Privacy Policy
            </EuiLink>
            .
          </EuiText>
          <EuiSpacer size="s" />
          <EuiText className={styles.aiAgreementText} color="subdued">
            Please do not include any personal data
            (except as expressly required for the use of Redis Copilot) or confidential information.
          </EuiText>
          <EuiSpacer size="m" />
          <EuiCheckbox
            className={styles.generalAgreementCheckbox}
            id="check-ai-agreement"
            name="checkGeneralAgreement"
            label="I accept the terms"
            checked={formik.values.checkGeneralAgreement}
            onChange={(e) => formik.setFieldValue('checkGeneralAgreement', e.target.checked)}
            data-testid="check-ai-agreement"
          />
        </div>

        {databaseId && (
          <>
            <EuiSpacer size="m" />
            <Divider colorVariable="separatorColor" />
            <EuiSpacer size="m" />

            <div className={styles.dbAgreementWrapper}>
              <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiToolTip
                    content={formik.values.checkGeneralAgreement ? null : 'Accept the Redis Copilot General terms'}
                  >
                    <EuiSwitch
                      showLabel={false}
                      label=""
                      disabled={!formik.values.checkGeneralAgreement}
                      checked={formik.values.checkDbAgreement}
                      onChange={(e) => toggleDbAgreement(e.target.checked)}
                      className={styles.switchOption}
                      data-testid="check-ai-database-agreement"
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText
                    className={cx(styles.aiAgreementSubtitle, labelStyle)}
                  >Allow access the information in your database
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size="m" />
              <EuiText className={styles.aiAgreementText} color="subdued">To provide context-aware assistance and construct accurate queries, Redis Copilot needs to retrieve data from your Redis database.</EuiText>
              <EuiSpacer size="m" />

              {formik.values.showWarningMessage && (
              <div className={styles.warnigMessageWrapper}>
                <EuiIcon type={WarningIcon} size="original" />
                <EuiText className={styles.aiAgreementText} color="subdued">This will delete the current message history and initiate a new session.</EuiText>
              </div>
              )}
            </div>
          </>
        )}

        <EuiSpacer size="m" />

        <div className={styles.actionsWrapper}>
          <EuiButton
            color="secondary"
            size="s"
            aria-label="cancel button"
            isLoading={formik.isSubmitting}
            onClick={onCancel}
            data-test-id="copilot-settings-cancel-btn"
          >Cancel
          </EuiButton>
          <EuiButton
            fill
            color="secondary"
            size="s"
            type="submit"
            aria-label="close copilot settings"
            isLoading={formik.isSubmitting}
            data-testId="copilot-settings-action-btn"
          >Save
          </EuiButton>
        </div>
      </EuiForm>
    </EuiPopover>
  )
}

export default CopilotSettingsPopover
