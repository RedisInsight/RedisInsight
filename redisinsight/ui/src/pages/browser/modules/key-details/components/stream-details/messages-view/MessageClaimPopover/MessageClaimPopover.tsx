import React, { useState, useEffect, ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiPopover,
  EuiForm,
  EuiFieldNumber,
  EuiSwitch,
  EuiText,
  EuiCheckbox,
  EuiToolTip,
} from '@elastic/eui'
import { useFormik } from 'formik'
import { orderBy, filter } from 'lodash'

import { isTruncatedString, isEqualBuffers, validateNumber } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  selectedGroupSelector,
  selectedConsumerSelector,
} from 'uiSrc/slices/browser/stream'
import {
  prepareDataForClaimRequest,
  getDefaultConsumer,
  ClaimTimeOptions,
} from 'uiSrc/utils/streamUtils'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import {
  ClaimPendingEntryDto,
  ClaimPendingEntriesResponse,
  ConsumerDto,
} from 'apiSrc/modules/browser/stream/dto'

import styles from './styles.module.scss'

const getConsumersOptions = (consumers: ConsumerDto[]) =>
  consumers.map((consumer) => ({
    value: consumer.name?.viewValue,
    inputDisplay: (
      <EuiText size="m" className={styles.option} data-testid="consumer-option">
        <EuiText className={styles.consumerName}>
          {consumer.name?.viewValue}
        </EuiText>
        <EuiText
          size="s"
          className={styles.pendingCount}
          data-testid="pending-count"
        >
          {`pending: ${consumer.pending}`}
        </EuiText>
      </EuiText>
    ),
  }))

const timeOptions: EuiSuperSelectOption<ClaimTimeOptions>[] = [
  { value: ClaimTimeOptions.RELATIVE, inputDisplay: 'Relative Time' },
  { value: ClaimTimeOptions.ABSOLUTE, inputDisplay: 'Timestamp' },
]

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  claimMessage: (
    data: Partial<ClaimPendingEntryDto>,
    successAction: (data: ClaimPendingEntriesResponse) => void,
  ) => void
  handleCancelClaim: () => void
}

const MessageClaimPopover = (props: Props) => {
  const {
    id,
    isOpen,
    closePopover,
    showPopover,
    claimMessage,
    handleCancelClaim,
  } = props

  const { data: consumers = [] } = useSelector(selectedGroupSelector) ?? {}
  const { name: currentConsumerName, pending = 0 } = useSelector(
    selectedConsumerSelector,
  ) ?? { name: '' }

  const [isOptionalShow, setIsOptionalShow] = useState<boolean>(false)
  const [consumerOptions, setConsumerOptions] = useState<
    EuiSuperSelectOption<string>[]
  >([])
  const [initialValues, setInitialValues] = useState({
    consumerName: '',
    minIdleTime: '0',
    timeCount: '0',
    timeOption: ClaimTimeOptions.RELATIVE,
    retryCount: '0',
    force: false,
  })

  const { instanceId } = useParams<{ instanceId: string }>()

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnBlur: false,
    onSubmit: (values) => {
      const data = prepareDataForClaimRequest(values, [id], isOptionalShow)
      claimMessage(data, onSuccessSubmit)
    },
  })

  const onSuccessSubmit = (data: ClaimPendingEntriesResponse) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_MESSAGE_CLAIMED,
      eventData: {
        databaseId: instanceId,
        pending: pending - data.affected.length,
      },
    })
    setIsOptionalShow(false)
    formik.resetForm()
    closePopover()
  }

  const handleClosePopover = () => {
    closePopover()
    setIsOptionalShow(false)
    formik.resetForm()
  }

  const handleChangeTimeFormat = (value: ClaimTimeOptions) => {
    formik.setFieldValue('timeOption', value)
    if (value === ClaimTimeOptions.ABSOLUTE) {
      formik.setFieldValue('timeCount', new Date().getTime())
    } else {
      formik.setFieldValue('timeCount', '0')
    }
  }

  const handleCancel = () => {
    handleCancelClaim()
    handleClosePopover()
  }

  useEffect(() => {
    const consumersWithoutTruncatedNames = filter(
      consumers,
      ({ name }) => !isTruncatedString(name),
    )
    const consumersWithoutCurrent = filter(
      consumersWithoutTruncatedNames,
      (consumer) => !isEqualBuffers(consumer.name, currentConsumerName),
    )
    const sortedConsumers = orderBy(
      getConsumersOptions(consumersWithoutCurrent),
      ['name.viewValue'],
      ['asc'],
    )
    if (sortedConsumers.length) {
      setConsumerOptions(sortedConsumers)
      setInitialValues({
        ...initialValues,
        consumerName: getDefaultConsumer(consumersWithoutCurrent)?.name
          ?.viewValue,
      })
    }
  }, [consumers, currentConsumerName])

  const button = (
    <SecondaryButton
      size="s"
      aria-label="Claim pending message"
      onClick={showPopover}
      data-testid="claim-pending-message"
      className={styles.claimBtn}
      disabled={consumerOptions.length < 1}
    >
      CLAIM
    </SecondaryButton>
  )

  const buttonTooltip = (
    <EuiToolTip
      content="There is no consumer to claim the message."
      position="top"
      display="inlineBlock"
      anchorClassName="flex-row"
      data-testid="claim-pending-message-tooltip"
    >
      {button}
    </EuiToolTip>
  )

  return (
    <EuiPopover
      key={id}
      onWheel={(e) => e.stopPropagation()}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      className="popover"
      panelPaddingSize="m"
      anchorClassName="claimPendingMessage"
      panelClassName={styles.popoverWrapper}
      closePopover={() => {}}
      button={consumerOptions.length < 1 ? buttonTooltip : button}
    >
      <EuiForm>
        <Row responsive>
          <FlexItem grow>
            <FormField label="Consumer">
              <EuiSuperSelect
                fullWidth
                itemClassName={styles.consumerOption}
                valueOfSelected={formik.values.consumerName}
                options={consumerOptions}
                className={styles.consumerField}
                name="consumerName"
                onChange={(value) =>
                  formik.setFieldValue('consumerName', value)
                }
                data-testid="destination-select"
              />
            </FormField>
          </FlexItem>
          <FlexItem grow className={styles.relative}>
            <FormField label="Min Idle Time">
              <EuiFieldNumber
                name="minIdleTime"
                id="minIdleTime"
                data-testid="min-idle-time"
                placeholder="0"
                className={styles.fieldWithAppend}
                value={formik.values.minIdleTime}
                append="msec"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateNumber(e.target.value.trim()),
                  )
                }}
                type="text"
                min={0}
              />
            </FormField>
          </FlexItem>
        </Row>
        {isOptionalShow && (
          <>
            <Spacer size="m" />
            <Row className={styles.container} align="center">
              <FlexItem grow className={styles.idle}>
                <FormField label="Idle Time">
                  <EuiFieldNumber
                    name="timeCount"
                    id="timeCount"
                    data-testid="time-count"
                    placeholder="0"
                    className={styles.fieldWithAppend}
                    value={formik.values.timeCount}
                    append="msec"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(
                        e.target.name,
                        validateNumber(e.target.value.trim()),
                      )
                    }}
                    type="text"
                    min={0}
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow className={styles.timeSelect}>
                <FormField className={styles.hiddenLabel} label="time">
                  <EuiSuperSelect
                    itemClassName={styles.timeOption}
                    valueOfSelected={formik.values.timeOption}
                    options={timeOptions}
                    className={styles.timeOptionField}
                    name="consumerName"
                    onChange={handleChangeTimeFormat}
                    data-testid="time-option-select"
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow>
                <FormField label="Retry Count">
                  <EuiFieldNumber
                    name="retryCount"
                    id="retryCount"
                    data-testid="retry-count"
                    placeholder="0"
                    className={styles.retryCountField}
                    value={formik.values.retryCount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(
                        e.target.name,
                        validateNumber(e.target.value.trim()),
                      )
                    }}
                    type="text"
                    min={0}
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow={2}>
                <FormField className={styles.hiddenLabel} label="force">
                  <EuiCheckbox
                    id="force_claim"
                    name="force"
                    label="Force Claim"
                    checked={formik.values.force}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue(e.target.name, !formik.values.force)
                    }}
                    data-testid="force-claim-checkbox"
                  />
                </FormField>
              </FlexItem>
            </Row>
          </>
        )}
        <Row responsive className={styles.footer}>
          <FlexItem>
            <EuiSwitch
              label="Optional Parameters"
              checked={isOptionalShow}
              onChange={(e) => setIsOptionalShow(e.target.checked)}
              className={styles.switchOption}
              data-testid="optional-parameters-switcher"
              compressed
            />
          </FlexItem>
          <div>
            <SecondaryButton
              className={styles.footerBtn}
              onClick={handleCancel}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              className={styles.footerBtn}
              type="submit"
              onClick={() => formik.handleSubmit()}
              data-testid="btn-submit"
            >
              Claim
            </PrimaryButton>
          </div>
        </Row>
      </EuiForm>
    </EuiPopover>
  )
}

export default MessageClaimPopover
