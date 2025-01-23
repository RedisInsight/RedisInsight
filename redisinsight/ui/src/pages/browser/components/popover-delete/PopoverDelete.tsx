import React from 'react'
import { EuiButton, EuiButtonIcon, EuiPopover, EuiText, EuiToolTip } from '@elastic/eui'

import { RedisString } from 'uiSrc/slices/interfaces'
import { isTruncatedString } from 'uiSrc/utils'
import { TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA } from 'uiSrc/constants'
import styles from './styles.module.scss'

export interface Props {
  header?: JSX.Element | string
  text: JSX.Element | string
  item: string
  itemRaw?: RedisString
  suffix?: string
  deleting: string
  closePopover: () => void
  showPopover: (item: string) => void
  updateLoading: boolean
  handleDeleteItem: (item: RedisString | string) => void
  handleButtonClick?: () => void
  appendInfo?: JSX.Element | string | null
  testid?: string
}

const PopoverDelete = (props: Props) => {
  const {
    header,
    text,
    item,
    itemRaw,
    suffix = '',
    deleting,
    closePopover,
    updateLoading,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
    testid = '',
  } = props

  const isDisabled = isTruncatedString(item)

  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    if (item + suffix !== deleting) {
      showPopover(item)
      handleButtonClick?.()
    } else {
      closePopover()
    }
  }

  const deleteButton = (
    <EuiButtonIcon
      iconType="trash"
      aria-label="Remove field"
      color="primary"
      disabled={isDisabled || updateLoading}
      onClick={isDisabled ? () => {} : onButtonClick}
      data-testid={testid ? `${testid}-icon` : 'remove-icon'}
      isDisabled={isDisabled}
    />
  )

  const deleteButtonWithTooltip = (
    <EuiToolTip
      content={TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA}
      anchorClassName={styles.editBtnAnchor}
      data-testid={testid ? `${testid}-tooltip` : 'remove-tooltip'}
    >
      {deleteButton}
    </EuiToolTip>
  )

  return (
    <EuiPopover
      key={item}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={item + suffix === deleting}
      closePopover={() => closePopover()}
      panelPaddingSize="m"
      anchorClassName="deleteFieldPopover"
      button={isDisabled ? deleteButtonWithTooltip : deleteButton}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popover}>
        <EuiText size="m">
          {!!header && (
            <h4>
              <b>{header}</b>
            </h4>
          )}
          <EuiText size="s">
            {text}
          </EuiText>
          {appendInfo}
        </EuiText>
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="trash"
            onClick={() => handleDeleteItem(itemRaw || item)}
            data-testid={testid || 'remove'}
          >
            Remove
          </EuiButton>
        </div>
      </div>
    </EuiPopover>
  )
}

export default PopoverDelete
