import React, {
  ChangeEvent,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { EuiText, EuiTextArea } from '@elastic/eui'

import {
  stringDataSelector,
  stringSelector,
  updateStringValueAction,
} from 'uiSrc/slices/string'
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
  const [value, setValue] = useState<string>('')
  const [areaValue, setAreaValue] = useState<string>('')

  const { loading } = useSelector(stringSelector)
  const { value: initialValue, key } = useSelector(stringDataSelector)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    setValue(initialValue)
    setAreaValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current) {
      return
    }

    const calculatedBreaks = value.split('\n').length
    const textAreaWidth = textAreaRef.current.clientWidth
    const OneRowLength = textAreaWidth / APPROXIMATE_WIDTH_OF_SIGN
    const calculatedRows = Math.round(value.length / OneRowLength + calculatedBreaks)

    if (calculatedRows > MAX_ROWS) { return setRows(MAX_ROWS) }
    if (calculatedRows < MIN_ROWS) { return setRows(MIN_ROWS) }
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
    setAreaValue(value)
    setIsEdit(false)
  }

  return (
    <div className={styles.container}>
      {!isEditItem && !loading && (
        <EuiText
          onClick={() => setIsEdit(true)}
        >
          <pre className={styles.stringValue} data-testid="string-value">
            {value.length ? value : (<span style={{ fontStyle: 'italic' }}>Empty</span>)}
          </pre>
        </EuiText>
      )}
      {isEditItem && (
        <InlineItemEditor
          initialValue={value}
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
