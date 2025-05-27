import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import {
  EuiIcon,
  EuiSuperSelect,
  EuiSuperSelectOption,
  EuiText,
} from '@elastic/eui'
import { useSelector } from 'react-redux'

import { GROUP_TYPES_DISPLAY } from 'uiSrc/constants'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

import styles from './styles.module.scss'

export interface Props {
  submitFilter: (type: string) => void
  isLoading?: boolean
}

const CHSearchFilter = ({ submitFilter, isLoading }: Props) => {
  const { commandGroups = [] } = useSelector(appRedisCommandsSelector)
  const { isEnteringCommand, matchedCommand, searchingCommandFilter } =
    useSelector(cliSettingsSelector)

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<string>(
    searchingCommandFilter,
  )

  useEffect(() => {
    if (isEnteringCommand && matchedCommand) {
      setTypeSelected('')
    }
  }, [isEnteringCommand])

  useEffect(() => {
    matchedCommand && setTypeSelected('')
  }, [matchedCommand])

  const groupOptions = [...commandGroups].sort().map((group: string) => ({
    text: (GROUP_TYPES_DISPLAY as any)[group] || group.replace(/_/g, ' '),
    value: group,
  }))

  const options: EuiSuperSelectOption<string>[] = groupOptions.map((item) => {
    const { value, text } = item
    return {
      value,
      inputDisplay: (
        <EuiText
          className={cx(styles.selectedType, 'text-capitalize')}
          size="s"
        >
          {text}
        </EuiText>
      ),
      dropdownDisplay: <EuiText className="text-capitalize">{text}</EuiText>,
      'data-test-subj': `filter-option-group-type-${value}`,
    }
  })

  const onChangeType = (initValue: string) => {
    const value = typeSelected === initValue ? '' : initValue
    setTypeSelected(value)
    setIsSelectOpen(false)
    submitFilter(value)
  }

  return (
    <OutsideClickDetector onOutsideClick={() => setIsSelectOpen(false)}>
      <div className={cx(styles.container)}>
        {!typeSelected && (
          <div
            className={styles.allTypes}
            onClick={() => !isLoading && setIsSelectOpen(!isSelectOpen)}
            role="presentation"
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
    </OutsideClickDetector>
  )
}

export default CHSearchFilter
