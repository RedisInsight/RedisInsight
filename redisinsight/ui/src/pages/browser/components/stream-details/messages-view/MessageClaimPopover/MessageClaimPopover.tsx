import React, { useState, useEffect, ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
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
  EuiText,
  // EuiCheckbox
} from '@elastic/eui'
import { useFormik } from 'formik'
import { orderBy, filter } from 'lodash'

import { selectedGroupSelector, selectedConsumerSelector } from 'uiSrc/slices/browser/stream'
import { validateNumber } from 'uiSrc/utils'
import { prepareDataForClaimRequest, getDefaultConsumer } from 'uiSrc/utils/streamUtils'
import { ClaimPendingEntryDto, ConsumerDto } from 'apiSrc/modules/browser/dto/stream.dto'

import styles from './styles.module.scss'

const getConsumersOptions = (consumers: ConsumerDto[]) => (
  consumers.map((consumer) => ({
    value: consumer.name,
    inputDisplay: (
      <EuiText size="m" className={styles.option}>
        <EuiText className={styles.consumerName}>{consumer.name}</EuiText>
        <EuiText size="s" className={styles.pendingCount} data-testid="pending-count">
          {`pending: ${consumer.pending}`}
        </EuiText>
      </EuiText>
    )
  }))
)

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  claimMessage: (data: Partial<ClaimPendingEntryDto>, successAction: () => void) => void
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
  const { name: currentConsumerName } = useSelector(selectedConsumerSelector) ?? { name: '' }

  const [isOptionalShow, setIsOptionalShow] = useState<boolean>(false)
  const [consumerOptions, setConsumerOptions] = useState<EuiSuperSelectOption<string>[]>([])

  const [initialValues, setInitialValues] = useState({
    consumerName: '',
    minIdleTime: '0',
    idle: '0',
    time: '0',
    retryCount: '0',
    force: false
  })

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
      const data = prepareDataForClaimRequest(values, [id], isOptionalShow)
      claimMessage(data, handleClosePopover)
    },
  })

  useEffect(() => {
    const consumersWithoutCurrent = filter(consumers, (consumer) => consumer.name !== currentConsumerName)
    const sortedConsumers = orderBy(getConsumersOptions(consumersWithoutCurrent), ['name'], ['asc'])
    setConsumerOptions(sortedConsumers)
    setInitialValues({
      ...initialValues,
      consumerName: getDefaultConsumer(consumersWithoutCurrent)?.name
    })
  }, [consumers, currentConsumerName])

  return (
    <EuiPopover
      key={id}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      className="popover"
      panelPaddingSize="m"
      anchorClassName="claimPendingMessage"
      panelClassName={styles.popoverWrapper}
      closePopover={() => {}}
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
                itemClassName={styles.consumerOption}
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
                id="minIdleTime"
                data-testid="min-idle-time"
                style={{ width: '162px', height: '36px', paddingRight: '40px' }}
                placeholder="0"
                className={styles.minIdleTime}
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
        {/* {isOptionalShow && (
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow label="Idle Time">
                <EuiFieldNumber
                  name="minIdleTime"
                  id="port"
                  data-testid="port"
                  style={{ width: '162px', height: '36px' }}
                  placeholder="Min Idle Time"
                  className={styles.minIdleTime}
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
              <EuiSuperSelect
                valueOfSelected={formik.values.consumerName}
                options={consumerOptions}
                style={{ width: '120px' }}
                name="consumerName"
                onChange={(value) => formik.setFieldValue('consumerName', value)}
                data-testid="destination-select"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Retry Count">
                <EuiFieldNumber
                  name="minIdleTime"
                  id="port"
                  data-testid="port"
                  style={{ width: '162px', height: '36px' }}
                  placeholder="Min Idle Time"
                  className={styles.minIdleTime}
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
            <EuiFlexItem>
              <EuiFormRow>
                <EuiCheckbox
                  id="force_claim"
                  name="force"
                  label="Force Claim"
                  checked={formik.values.force}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    formik.setFieldValue(e.target.name, !formik.values.force)
                  }}
                  data-testid="showDb"
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        )} */}
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
