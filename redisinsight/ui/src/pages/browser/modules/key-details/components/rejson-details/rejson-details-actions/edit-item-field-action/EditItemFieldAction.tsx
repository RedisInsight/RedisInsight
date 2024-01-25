import React from 'react'
import { EuiButtonIcon } from '@elastic/eui'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { bufferToString, createDeleteFieldHeader, createDeleteFieldMessage } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import styles from '../../styles.module.scss'

export interface Props {
  type: string;
  keyName: string;
  selectedKey: string | RedisResponseBuffer;
  path: string,
  deleting: string,
  setDeleting: (value: string) => void;
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void;
  onClickEditEntireItem: () => void;
}

const EditItemFieldAction = ({
  type,
  keyName,
  selectedKey,
  path,
  deleting,
  setDeleting,
  handleSubmitRemoveKey,
  onClickEditEntireItem
}: Props) => {
  const dataTestId = () => {
    if (type === 'object') return 'edit-object-btn'
    if (type === 'array') return 'btn-edit-field'
    return ''
  }

  return (
    <div className={styles.actionButtons}>
      <EuiButtonIcon
        iconType="documentEdit"
        className={styles.jsonButtonStyle}
        onClick={onClickEditEntireItem}
        aria-label="Edit field"
        color="primary"
        data-testid={dataTestId()}
      />
      <PopoverDelete
        header={createDeleteFieldHeader(keyName)}
        text={createDeleteFieldMessage(bufferToString(selectedKey))}
        item={keyName}
        suffix={type}
        deleting={deleting}
        closePopover={() => setDeleting('')}
        updateLoading={false}
        showPopover={(item) => { setDeleting(`${item}${type}`) }}
        handleDeleteItem={() => handleSubmitRemoveKey(path, keyName)}
      />
    </div>
  )
}

export { EditItemFieldAction }
