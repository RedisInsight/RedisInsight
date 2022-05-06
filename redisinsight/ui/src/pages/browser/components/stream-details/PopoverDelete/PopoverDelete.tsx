import React from 'react'
import { EuiButton, EuiButtonIcon, EuiPopover, EuiText } from '@elastic/eui'
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
  appendInfo?: JSX.Element | string | null,
  customMessage?: JSX.Element | string,
  testid?: string,
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
    testid = '',
  } = props

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
      panelPaddingSize="m"
      className={styles.btnWrapper}
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
          <EuiText size="s" className={styles.text}>
            The Entry will be removed from
          </EuiText>
          <EuiText size="m" className={styles.name}>
            {keyName}
          </EuiText>
        </EuiText>
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
