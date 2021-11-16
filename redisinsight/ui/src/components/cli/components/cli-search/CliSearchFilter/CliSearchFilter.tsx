import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiIcon,
  EuiOutsideClickDetector,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText
} from '@elastic/eui'
import { useSelector } from 'react-redux'

import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { FILTER_GROUP_TYPE_OPTIONS } from 'uiSrc/components/cli/components/cli-search/CliSearchFilter/constants'

import styles from './styles.module.scss'

export interface Props {
  submitFilter: (type: string) => void;
  isLoading?: boolean;
}

const CliSearchFilter = ({ submitFilter, isLoading }: Props) => {
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<string>('')

  const { isEnteringCommand, matchedCommand } = useSelector(cliSettingsSelector)

  useEffect(() => {
    if (isEnteringCommand && matchedCommand) {
      setTypeSelected('')
    }
  }, [isEnteringCommand])

  useEffect(() => {
    setTypeSelected('')
  }, [matchedCommand])

  const options: EuiSuperSelectOption<string>[] = FILTER_GROUP_TYPE_OPTIONS.map(
    (item) => {
      const { value, text } = item
      return {
        value,
        inputDisplay: (
          <EuiText className={styles.selectedType} size="s">
            {text}
          </EuiText>
        ),
        dropdownDisplay: <EuiText>{text}</EuiText>,
        'data-test-subj': `filter-option-group-type-${value}`,
      }
    }
  )

  const onChangeType = (initValue: string) => {
    const value = typeSelected === initValue ? '' : initValue
    setTypeSelected(value)
    setIsSelectOpen(false)
    submitFilter(value)
  }

  return (
    <EuiOutsideClickDetector
      onOutsideClick={() => setIsSelectOpen(false)}
    >
      <div
        className={cx(
          styles.container
        )}
      >
        {!typeSelected && (
          <div
            className={styles.allTypes}
            onClick={() => !isLoading && setIsSelectOpen(!isSelectOpen)}
          >
            <EuiIcon
              type="controlsVertical"
              data-testid="filter-option--group-type-default"
              className={cx(styles.controlsIcon, styles.allTypesIcon)}
            />
          </div>
        )}
        <EuiSuperSelect
          disabled={isLoading}
          isLoading={isLoading}
          fullWidth
          itemClassName={cx('withColorDefinition', styles.filterKeyType)}
          options={options}
          isOpen={isSelectOpen}
          valueOfSelected={typeSelected}
          onChange={(value: string) => onChangeType(value)}
          data-testid="select-filter-group-type"
        />
      </div>
    </EuiOutsideClickDetector>
  )
}

export default CliSearchFilter
