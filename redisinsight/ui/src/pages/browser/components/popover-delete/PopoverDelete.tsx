import React from 'react'
import { EuiButton, EuiButtonIcon, EuiPopover, EuiSpacer, EuiText } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  header?: string,
  text: JSX.Element | string,
  item: string,
  suffix: string,
  deleting: string,
  closePopover: () => void,
  showPopover: (item: string) => void,
  updateLoading: boolean,
  handleDeleteItem: (item: string) => void,
  handleButtonClick?: () => void,
  appendInfo?: JSX.Element | string | null,
  testid?: string,
}

const PopoverDelete = (props: Props) => {
  const {
    header,
    text,
    item,
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
      key={item}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={item + suffix === deleting}
      closePopover={() => closePopover()}
      panelPaddingSize="m"
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
          {!!header && (
            <h4 className={styles.popoverTitle}>
              {header}
            </h4>
          )}
          <EuiText size="s" className={styles.popoverSubTitle}>
            {text}
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
