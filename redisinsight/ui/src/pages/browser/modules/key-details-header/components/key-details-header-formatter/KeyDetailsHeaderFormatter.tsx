import cx from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { EuiIcon, EuiSuperSelect, EuiSuperSelectOption, EuiText, EuiTextColor, EuiToolTip } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { KeyTypes, KeyValueFormat, MIDDLE_SCREEN_RESOLUTION, TEXT_DISABLED_STRING_FORMATTING, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { keysSelector, selectedKeyDataSelector, selectedKeySelector, setViewFormat } from 'uiSrc/slices/browser/keys'
import { getBasedOnViewTypeEvent, sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import FormattersLight from 'uiSrc/assets/img/icons/formatter_light.svg'
import FormattersDark from 'uiSrc/assets/img/icons/formatter_dark.svg'
import { stringDataSelector } from 'uiSrc/slices/browser/string'
import { isFullStringLoaded } from 'uiSrc/utils'
import { getKeyValueFormatterOptions } from './constants'
import styles from './styles.module.scss'

export interface Props {
  width: number
}
const KeyDetailsHeaderFormatter = (props: Props) => {
  const { width } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { theme } = useContext(ThemeContext)
  const { viewType } = useSelector(keysSelector)
  const { viewFormat } = useSelector(selectedKeySelector)
  const { type: keyType, length } = useSelector(selectedKeyDataSelector) ?? {}
  const { value: keyValue } = useSelector(stringDataSelector)

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<KeyValueFormat>(viewFormat)
  const [options, setOptions] = useState<EuiSuperSelectOption<KeyValueFormat>[]>([])

  const dispatch = useDispatch()

  const isStringFormattingEnabled = keyType === KeyTypes.String
    ? isFullStringLoaded(keyValue?.data?.length, length)
    : true

  useEffect(() => {
    const newOptions: EuiSuperSelectOption<KeyValueFormat>[] = getKeyValueFormatterOptions(keyType).map(
      ({ value, text }) => ({
        value,
        inputDisplay: (
          <EuiToolTip
            content={!isStringFormattingEnabled ? TEXT_DISABLED_STRING_FORMATTING : typeSelected}
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <>
              {width > MIDDLE_SCREEN_RESOLUTION && (
                <EuiTextColor color="subdued" className={styles.optionText}>{text}</EuiTextColor>
              )}
              {width <= MIDDLE_SCREEN_RESOLUTION && (
                <EuiIcon
                  type={theme === Theme.Dark ? FormattersDark : FormattersLight}
                  className={styles.controlsIcon}
                  data-testid={`key-value-formatter-option-selected-${value}`}
                />
              )}
            </>
          </EuiToolTip>
        ),
        dropdownDisplay: <EuiText size="s" className={styles.dropdownDisplay}>{text}</EuiText>,
        'data-test-subj': `format-option-${value}`,
      })
    )

    setOptions(newOptions)
  }, [viewFormat, keyType, width, isStringFormattingEnabled])

  const onChangeType = (value: KeyValueFormat) => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_DETAILS_FORMATTER_CHANGED, TelemetryEvent.TREE_VIEW_KEY_DETAILS_FORMATTER_CHANGED
      ),
      eventData: {
        keyType,
        databaseId: instanceId,
        fromFormatter: viewFormat,
        toFormatter: value,
      }
    })

    setTypeSelected(value)
    setIsSelectOpen(false)
    dispatch(setViewFormat(value))
  }

  if (!options.length) {
    return null
  }

  return (
    <div className={cx(styles.container, { [styles.fullWidth]: width > MIDDLE_SCREEN_RESOLUTION })}>
      <div className={styles.selectWrapper}>
        <EuiSuperSelect
          disabled={!isStringFormattingEnabled}
          fullWidth
          isOpen={isSelectOpen}
          options={options}
          valueOfSelected={typeSelected}
          className={styles.changeView}
          itemClassName={styles.formatType}
          onChange={(value: KeyValueFormat) => onChangeType(value)}
          data-testid="select-format-key-value"
        />
      </div>
    </div>
  )
}

export { KeyDetailsHeaderFormatter }
