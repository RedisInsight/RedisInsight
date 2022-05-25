import React, {
  ChangeEvent,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiProgress, EuiText, EuiTextArea } from '@elastic/eui'

import { Nullable } from 'uiSrc/utils'
import {
  resetStringValue,
  stringDataSelector,
  stringSelector,
  updateStringValueAction,
} from 'uiSrc/slices/browser/string'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { AddStringFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'

import styles from './styles.module.scss'

const MAX_ROWS = 25
const MIN_ROWS = 4
const APPROXIMATE_WIDTH_OF_SIGN = 8.3

export interface Props {
  isEditItem: boolean;
  setIsEdit: (isEdit: boolean) => void;
}

const StringDetails = (props: Props) => {
  const { isEditItem, setIsEdit } = props

  const [rows, setRows] = useState<number>(5)
  const [value, setValue] = useState<Nullable<string>>(null)
  const [areaValue, setAreaValue] = useState<string>('')

  const { loading } = useSelector(stringSelector)
  const { value: initialValue, key } = useSelector(stringDataSelector)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(resetStringValue())
  }, [])

  useEffect(() => {
    setValue(initialValue)
    setAreaValue(initialValue || '')
  }, [initialValue])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current || value === null) {
      return
    }

    const calculatedBreaks = value.split('\n').length
    const textAreaWidth = textAreaRef.current.clientWidth
    const OneRowLength = textAreaWidth / APPROXIMATE_WIDTH_OF_SIGN
    const calculatedRows = Math.round(value.length / OneRowLength + calculatedBreaks)

    if (calculatedRows > MAX_ROWS) {
      setRows(MAX_ROWS)
      return
    }
    if (calculatedRows < MIN_ROWS) {
      setRows(MIN_ROWS)
      return
    }
    setRows(calculatedRows)
  }, [isEditItem])

  useMemo(() => {
    if (isEditItem) {
      (document.activeElement as HTMLElement)?.blur()
    }
  }, [isEditItem])

  const onApplyChanges = () => {
    const onSuccess = () => {
      setIsEdit(false)
      setValue(areaValue)
    }
    dispatch(updateStringValueAction(key, areaValue, onSuccess))
  }

  const onDeclineChanges = () => {
    setAreaValue(value || '')
    setIsEdit(false)
  }

  const isLoading = loading || value === null

  return (
    <div className={styles.container}>
      {isLoading && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-key-string"
        />
      )}
      {!isEditItem && (
        <EuiText
          onClick={() => setIsEdit(true)}
        >
          <pre className={styles.stringValue} data-testid="string-value">
            {value !== '' ? value : (<span style={{ fontStyle: 'italic' }}>Empty</span>)}
          </pre>
        </EuiText>
      )}
      {isEditItem && (
        <InlineItemEditor
          initialValue={value || ''}
          controlsPosition="bottom"
          placeholder="Enter Value"
          fieldName="value"
          expandable
          isLoading={false}
          onDecline={onDeclineChanges}
          onApply={onApplyChanges}
          declineOnUnmount={false}
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
            className={styles.stringTextArea}
            data-testid="string-value"
          />
        </InlineItemEditor>
      )}
    </div>
  )
}

export default StringDetails
