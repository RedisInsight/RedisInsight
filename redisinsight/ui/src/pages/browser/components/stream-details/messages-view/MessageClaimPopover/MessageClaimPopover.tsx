import React, { useState, useEffect, ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import {
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiPopover,
  EuiButton,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiFieldNumber,
  EuiSwitch,
  EuiText
} from '@elastic/eui'
import { useFormik } from 'formik'
import { orderBy } from 'lodash'

import { selectedGroupSelector } from 'uiSrc/slices/browser/stream'
import { validateNumber } from 'uiSrc/utils'
import {
  ClaimPendingEntryDto,
  ConsumerDto
} from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

const getConsumersOptions = (consumers: ConsumerDto[]) => (
  consumers.map((consumer) => ({
    value: consumer.name,
    inputDisplay: (
      <EuiText size="m" className={styles.option}>
        {consumer.name}
        <EuiText size="s" className={styles.pendingCount} data-testid="pending-count">
          {`pending: ${consumer.pending}`}
        </EuiText>
      </EuiText>
    )
  }))
)

const getDefaultConsumer = (consumers: ConsumerDto[]): ConsumerDto => {
  const sortedConsumers = orderBy(consumers, ['pending', 'name'], ['asc', 'asc'])
  return sortedConsumers[0]
}

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  claimMessage: (data: ClaimPendingEntryDto, successAction: () => void) => void
}

const MessageClaimPopover = (props: Props) => {
  const {
    id,
    isOpen,
    closePopover,
    showPopover,
    claimMessage
  } = props

  const {
    data: consumers = [],
  } = useSelector(selectedGroupSelector) ?? {}

  const [initialValues] = useState({
    consumerName: getDefaultConsumer(consumers)?.name,
    minIdleTime: 0,
  })

  const [isOptionalShow, setIsOptionalShow] = useState<boolean>(false)
  const [consumerOptions, setConsumerOptions] = useState<EuiSuperSelectOption<string>[]>([])

  const handleClosePopover = () => {
    closePopover()
    setIsOptionalShow(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnBlur: false,
    onSubmit: (values) => {
      claimMessage({ ...values, entries: [id] }, handleClosePopover)
    },
  })

  useEffect(() => {
    const sortedConsumers = orderBy(getConsumersOptions(consumers), ['name'], ['asc'])
    setConsumerOptions(sortedConsumers)
  }, [consumers])

  return (
    <EuiPopover
      key={id}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      closePopover={handleClosePopover}
      panelPaddingSize="m"
      anchorClassName="claimPendingMessage"
      button={(
        <EuiButton
          size="s"
          color="secondary"
          aria-label="Claim pending message"
          onClick={showPopover}
          data-testid="claim-pending-message"
          className={styles.claimBtn}
        >
          CLAIM
        </EuiButton>
      )}
    >
      <EuiForm>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label="Consumer">
              <EuiSuperSelect
                valueOfSelected={formik.values.consumerName}
                options={consumerOptions}
                style={{ width: '389px' }}
                name="consumerName"
                onChange={(value) => formik.setFieldValue('consumerName', value)}
                data-testid="destination-select"
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow
              label="Min Idle Time"
            >
              <EuiFieldNumber
                name="minIdleTime"
                id="port"
                data-testid="port"
                style={{ width: '162px', height: '36px' }}
                placeholder="Min Idle Time"
                value={formik.values.minIdleTime}
                append="ms"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateNumber(e.target.value.trim())
                  )
                }}
                type="text"
                min={0}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup className={styles.footer}>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label="Optional Parameters"
              checked={isOptionalShow}
              onChange={(e) => setIsOptionalShow(e.target.checked)}
              className={styles.switchOption}
              data-testid="optional-parameters-switcher"
              compressed
            />
          </EuiFlexItem>
          <div>
            <EuiButton
              color="secondary"
              className={styles.footerBtn}
              onClick={handleClosePopover}
            >
              Cancel
            </EuiButton>
            <EuiButton
              fill
              color="secondary"
              className={styles.footerBtn}
              size="m"
              type="submit"
              onClick={() => formik.handleSubmit()}
              data-testid="btn-submit"
            >
              Claim
            </EuiButton>
          </div>
        </EuiFlexGroup>
      </EuiForm>
    </EuiPopover>
  )
}

export default MessageClaimPopover
