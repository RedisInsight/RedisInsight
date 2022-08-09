import React, { useContext, useEffect, useState } from 'react'
import { EuiIcon, EuiSuperSelect, EuiSuperSelectOption, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import { KeyValueFormat, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { selectedKeyDataSelector, selectedKeySelector, setViewFormat } from 'uiSrc/slices/browser/keys'
import { getKeyValueFormatterOptions } from './constants'
import { MIDDLE_SCREEN_RESOLUTION } from '../../KeyDetailsHeader'
import styles from './styles.module.scss'

export interface Props {
  width: number
}
const KeyValueFormatter = (props: Props) => {
  const { width } = props

  const { theme } = useContext(ThemeContext)
  const { viewFormat } = useSelector(selectedKeySelector)
  const { type: keyType } = useSelector(selectedKeyDataSelector) ?? {}

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<KeyValueFormat>(viewFormat)
  const [options, setOptions] = useState<EuiSuperSelectOption<KeyValueFormat>[]>([])

  const dispatch = useDispatch()

  useEffect(() => {
    const newOptions: EuiSuperSelectOption<KeyValueFormat>[] = getKeyValueFormatterOptions(keyType).map(
      (item) => {
        const { value, text, iconDark, iconLight } = item
        return {
          value,
          inputDisplay: (
            <>
              {text}
              {/* Waiting for icon */}
              {/* {width > MIDDLE_SCREEN_RESOLUTION && text}
              {width <= MIDDLE_SCREEN_RESOLUTION && (
                <EuiIcon
                  type={theme === Theme.Dark ? iconDark : iconLight}
                  className={styles.controlsIcon}
                  data-testid={`key-value-formatter-option-selected-${value}`}
                />
                )}
              >
                {text}
              </EuiText>
              */}
            </>
          ),
          dropdownDisplay: <EuiText className={styles.dropdownDisplay}>{text}</EuiText>,
          'data-test-subj': `format-option-${value}`,
        }
      }
    )

    setOptions(newOptions)
  }, [viewFormat, keyType, width])

  const onChangeType = (value: KeyValueFormat) => {
    setTypeSelected(value)
    setIsSelectOpen(false)
    dispatch(setViewFormat(value))
  }

  if (!options.length) {
    return null
  }

  return (
    <div className={styles.container}>
      <EuiSuperSelect
        // isOpen
        isOpen={isSelectOpen}
        options={options}
        valueOfSelected={typeSelected}
        className={styles.changeView}
        itemClassName={styles.formatType}
        onChange={(value: KeyValueFormat) => onChangeType(value)}
        data-testid="select-format-key-value"
      />
    </div>
  )
}

export default KeyValueFormatter
