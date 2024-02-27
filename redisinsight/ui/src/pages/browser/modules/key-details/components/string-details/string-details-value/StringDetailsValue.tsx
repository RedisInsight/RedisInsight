import React, {
  ChangeEvent,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiProgress, EuiText, EuiTextArea, EuiToolTip } from '@elastic/eui'

import {
  bufferToSerializedFormat,
  bufferToString,
  formattingBuffer,
  isNonUnicodeFormatter,
  isEqualBuffers,
  isFormatEditable,
  stringToBuffer,
  stringToSerializedBufferFormat,
  isFullStringLoaded,
} from 'uiSrc/utils'
import {
  fetchDownloadStringValue,
  resetStringValue,
  setIsStringCompressed,
  stringDataSelector,
  stringSelector,
  updateStringValueAction,
} from 'uiSrc/slices/browser/string'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { AddStringFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import {
  KeyTypes, ModulesKeyTypes,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
  STRING_MAX_LENGTH
} from 'uiSrc/constants'
import { calculateTextareaLines } from 'uiSrc/utils/calculateTextareaLines'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'

import styles from './styles.module.scss'

const MIN_ROWS = 8
const APPROXIMATE_WIDTH_OF_SIGN = 8.6
const MAX_LENGTH = STRING_MAX_LENGTH + 1

export interface Props {
  isEditItem: boolean;
  setIsEdit: (isEdit: boolean) => void;
  onRefresh: (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes, args: IFetchKeyArgs) => void;
}

const StringDetailsValue = (props: Props) => {
  const { isEditItem, setIsEdit, onRefresh } = props

  const { compressor = null } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(stringSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { value: initialValue } = useSelector(stringDataSelector)
  const { name: key, type: keyType, length } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const [rows, setRows] = useState<number>(MIN_ROWS)
  const [value, setValue] = useState<JSX.Element | string>('')
  const [areaValue, setAreaValue] = useState<string>('')
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [isValid, setIsValid] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isEditable, setIsEditable] = useState(true)
  const [noEditableText, setNoEditableText] = useState<string>(TEXT_DISABLED_COMPRESSED_VALUE)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)
  const viewValueRef: Ref<HTMLPreElement> = useRef(null)
  const containerRef: Ref<HTMLDivElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(resetStringValue())
  }, [])

  useEffect(() => {
    if (!initialValue) return

    const { value: decompressedValue, isCompressed } = decompressingBuffer(initialValue, compressor)

    const initialValueString = bufferToString(decompressedValue, viewFormat)
    const { value: formattedValue, isValid } = formattingBuffer(decompressedValue, viewFormatProp, { expanded: true })
    setAreaValue(initialValueString)

    setValue(!isFullStringLoaded(initialValue?.data?.length, length) ? `${formattedValue}...` : formattedValue)
    setIsValid(isValid)
    setIsDisabled(
      !isNonUnicodeFormatter(viewFormatProp, isValid)
        && !isEqualBuffers(initialValue, stringToBuffer(initialValueString))
    )
    setIsEditable(
      !isCompressed
      && isFormatEditable(viewFormatProp)
      && isFullStringLoaded(initialValue?.data?.length, length)
    )
    setNoEditableText(isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp))

    dispatch(setIsStringCompressed(isCompressed))

    if (viewFormat !== viewFormatProp) {
      setViewFormat(viewFormatProp)
    }
  }, [initialValue, viewFormatProp, compressor, length])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current || value === null) {
      return
    }
    const calculatedRows = calculateTextareaLines(areaValue, textAreaRef.current.clientWidth, APPROXIMATE_WIDTH_OF_SIGN)
    if (calculatedRows > MIN_ROWS) {
      setRows(calculatedRows)
    }
  }, [viewValueRef, isEditItem])

  useMemo(() => {
    if (isEditItem && initialValue) {
      (document.activeElement as HTMLElement)?.blur()
      setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    }
  }, [isEditItem])

  const onApplyChanges = () => {
    const data = stringToSerializedBufferFormat(viewFormat, areaValue)
    const onSuccess = () => {
      setIsEdit(false)
      setValue(formattingBuffer(data, viewFormat, { expanded: true })?.value)
    }
    dispatch(updateStringValueAction(key, data, onSuccess))
  }

  const onDeclineChanges = useCallback(() => {
    if (!initialValue) return

    setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    setIsEdit(false)
  }, [initialValue])

  const isLoading = loading || value === null

  const handleLoadAll = (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes) => {
    const endString = length - 1
    onRefresh(key, type, { end: endString })
    sendEventTelemetry({
      event: TelemetryEvent.STRING_LOAD_ALL_CLICKED,
      eventData: {
        databaseId: instanceId,
        length,
      }
    })
  }

  const handleDownloadString = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    dispatch(fetchDownloadStringValue(key, downloadFile))
    sendEventTelemetry({
      event: TelemetryEvent.STRING_DOWNLOAD_VALUE_CLICKED,
      eventData: {
        databaseId: instanceId,
        length,
      }
    })
  }

  return (
    <>
      <div className={styles.container} ref={containerRef} data-testid="string-details">
        {isLoading && (
          <EuiProgress
            color="primary"
            size="xs"
            position="absolute"
            data-testid="progress-key-string"
          />
        )}
        {!isEditItem && (
          <EuiToolTip
            title={!isValid ? noEditableText : undefined}
            anchorClassName={styles.tooltipAnchor}
            className={styles.tooltip}
            position="left"
            data-testid="string-value-tooltip"
          >
            <EuiText
              className={styles.stringValue}
              onClick={() => isEditable && setIsEdit(true)}
              style={{ whiteSpace: 'break-spaces' }}
              data-testid="string-value"
            >
              {areaValue !== ''
                ? value
                : (!isLoading && (<span style={{ fontStyle: 'italic' }}>Empty</span>))}
            </EuiText>
          </EuiToolTip>
        )}
        {isEditItem && (
          <InlineItemEditor
            controlsPosition="bottom"
            placeholder="Enter Value"
            fieldName="value"
            expandable
            isLoading={false}
            isDisabled={isDisabled}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={onDeclineChanges}
            onApply={onApplyChanges}
            declineOnUnmount={false}
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={() =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, areaValue),
                viewFormat
              )?.isValid}
          >
            <EuiTextArea
              fullWidth
              name="value"
              id="value"
              rows={rows}
              resize="vertical"
              placeholder={config.value.placeholder}
              value={areaValue}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setAreaValue(e.target.value)
              }}
              disabled={loading}
              inputRef={textAreaRef}
              className={cx(styles.stringTextArea, { [styles.areaWarning]: isDisabled })}
              style={{ maxHeight: containerRef.current ? containerRef.current?.clientHeight - 80 : '100%' }}
              data-testid="string-value"
            />
          </InlineItemEditor>
        )}
      </div>

      {length > MAX_LENGTH && (
        <div className="key-details-footer" key="key-details-footer">
          <EuiFlexGroup
            gutterSize="none"
            justifyContent="spaceBetween"
            alignItems="center"
            responsive={false}
          >
            <EuiFlexItem grow={false}>
              {!isFullStringLoaded(initialValue?.data?.length, length) && (
                <EuiButton
                  className={styles.stringFooterBtn}
                  size="s"
                  color="secondary"
                  data-testid="load-all-value-btn"
                  onClick={() => handleLoadAll(key, keyType)}
                >
                  Load all
                </EuiButton>
              )}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                className={styles.stringFooterBtn}
                size="s"
                color="secondary"
                iconType="download"
                iconSide="right"
                data-testid="download-all-value-btn"
                onClick={handleDownloadString}
              >
                Download
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      )}
    </>
  )
}

export { StringDetailsValue }
