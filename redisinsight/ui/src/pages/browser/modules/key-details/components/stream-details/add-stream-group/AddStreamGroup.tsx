import { EuiFieldText, EuiIcon } from '@elastic/eui'
import cx from 'classnames'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { lastDeliveredIDTooltipText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { addNewGroupAction } from 'uiSrc/slices/browser/stream'
import {
  consumerGroupIdRegex,
  stringToBuffer,
  validateConsumerGroupId,
} from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiTooltip } from 'uiSrc/components'
import { CreateConsumerGroupsDto } from 'apiSrc/modules/browser/stream/dto'

import styles from './styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddStreamGroup = (props: Props) => {
  const { closePanel } = props
  const { name: keyName = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }

  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>('')
  const [id, setId] = useState<string>('$')
  const [idError, setIdError] = useState<string>('')
  const [isIdFocused, setIsIdFocused] = useState<boolean>(false)

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = !!groupName.length && !idError
    setIsFormValid(isValid)
  }, [groupName, idError])

  useEffect(() => {
    if (!consumerGroupIdRegex.test(id)) {
      setIdError('ID format is not correct')
      return
    }
    setIdError('')
  }, [id])

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_GROUP_CREATED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const submitData = () => {
    if (isFormValid) {
      const data: CreateConsumerGroupsDto = {
        keyName,
        consumerGroups: [
          {
            name: stringToBuffer(groupName),
            lastDeliveredId: id,
          },
        ],
      }
      dispatch(addNewGroupAction(data, onSuccessAdded))
    }
  }

  const showIdError = !isIdFocused && idError

  return (
    <>
      <div
        className={styles.content}
        data-test-subj="add-stream-groups-field-panel"
      >
        <FlexItem
          className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
          grow
        >
          <Row>
            <FlexItem grow>
              <Row align="start">
                <FlexItem className={styles.groupNameWrapper} grow>
                  <FormField>
                    <EuiFieldText
                      fullWidth
                      name="group-name"
                      id="group-name"
                      placeholder="Enter Group Name*"
                      value={groupName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setGroupName(e.target.value)
                      }
                      autoComplete="off"
                      data-testid="group-name-field"
                    />
                  </FormField>
                </FlexItem>
                <FlexItem className={styles.timestampWrapper} grow>
                  <FormField>
                    <EuiFieldText
                      fullWidth
                      name="id"
                      id="id"
                      placeholder="ID*"
                      value={id}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setId(validateConsumerGroupId(e.target.value))
                      }
                      onBlur={() => setIsIdFocused(false)}
                      onFocus={() => setIsIdFocused(true)}
                      append={
                        <RiTooltip
                          anchorClassName="inputAppendIcon"
                          className={styles.entryIdTooltip}
                          position="left"
                          title="Enter Valid ID, 0 or $"
                          content={lastDeliveredIDTooltipText}
                        >
                          <EuiIcon
                            type="iInCircle"
                            style={{ cursor: 'pointer' }}
                            data-testid="entry-id-info-icon"
                          />
                        </RiTooltip>
                      }
                      autoComplete="off"
                      data-testid="id-field"
                    />
                  </FormField>
                  {!showIdError && (
                    <span className={styles.idText} data-testid="id-help-text">
                      Timestamp - Sequence Number or $
                    </span>
                  )}
                  {showIdError && (
                    <span className={styles.error} data-testid="id-error">
                      {idError}
                    </span>
                  )}
                </FlexItem>
              </Row>
            </FlexItem>
          </Row>
        </FlexItem>
      </div>
      <>
        <Row justify="end" gap="l" style={{ padding: 18 }}>
          <FlexItem>
            <div>
              <SecondaryButton
                onClick={() => closePanel(true)}
                data-testid="cancel-stream-groups-btn"
              >
                Cancel
              </SecondaryButton>
            </div>
          </FlexItem>
          <FlexItem>
            <div>
              <PrimaryButton
                onClick={submitData}
                disabled={!isFormValid}
                data-testid="save-groups-btn"
              >
                Save
              </PrimaryButton>
            </div>
          </FlexItem>
        </Row>
      </>
    </>
  )
}

export default AddStreamGroup
