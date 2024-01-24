import React from 'react'
import { EuiButtonIcon } from '@elastic/eui'
import styles from '../../styles.module.scss'

export interface Props {
  leftPadding: string;
  type: string;
  onClickSetKVPair: () => void
}

const AddItemFieldAction = ({
  leftPadding,
  type,
  onClickSetKVPair,
}: Props) => {
  const brackets = () => {
    if (type === 'object') return <>&#125;</>
    if (type === 'array') return <>&#93;</>
    return <></>
  }

  return (
    <div
      className={styles.row}
      style={{ paddingLeft: `${leftPadding}em` }}
    >
      <span className={styles.defaultFont}>{brackets()}</span>
      <EuiButtonIcon
        iconType="plus"
        className={styles.jsonButtonStyle}
        onClick={onClickSetKVPair}
        aria-label="Add field"
        data-testid="add-field-btn"
      />
    </div>
  )
}

export { AddItemFieldAction }
