import React from 'react'
import { EuiButton, EuiButtonIcon, EuiPopover, EuiSpacer, EuiText } from '@elastic/eui'
import { formatNameShort } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  item: string,
  suffix: string,
  deleting: string,
  closePopover: () => void,
  showPopover: (item: any) => void,
  updateLoading: boolean,
  handleDeleteItem: (item: string) => void,
  handleButtonClick?: () => void,
  keyName: string,
  appendInfo?: JSX.Element | string | null
  testid?: string;
}

const PopoverDelete = (props: Props) => {
  const {
    item,
    keyName,
    suffix,
    deleting,
    closePopover,
    updateLoading,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
    testid = '',
  } = props

  const shorKeyName = formatNameShort(keyName)
  const shorItemName = formatNameShort(item)

  const onButtonClick = () => {
    if (item + suffix !== deleting) {
      showPopover(item)
      handleButtonClick?.()
    } else {
      closePopover()
    }
  }

  return (
    <EuiPopover
      key={shorItemName}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={item + suffix === deleting}
      closePopover={() => closePopover()}
      panelPaddingSize="l"
      anchorClassName="deleteFieldPopover"
      button={(
        <EuiButtonIcon
          iconType="trash"
          aria-label="Remove field"
          className="deleteFieldBtn"
          color="primary"
          disabled={updateLoading}
          onClick={onButtonClick}
          data-testid={testid ? `${testid}-icon` : 'remove-icon'}
        />
      )}
    >
      <div className={styles.popover}>
        <EuiText size="m">
          <h4 className={styles.popoverTitle}>
            <b>{shorItemName}</b>
          </h4>
          <EuiText size="s" className={styles.popoverSubTitle}>
            will be removed from
            {' '}
            <b>{shorKeyName}</b>
          </EuiText>
          {appendInfo}
        </EuiText>
        <EuiSpacer />
        <div className={styles.popoverFooter}>
          <EuiButton
            fill
            size="s"
            color="warning"
            iconType="trash"
            onClick={() => handleDeleteItem(item)}
            className={styles.popoverDeleteBtn}
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
