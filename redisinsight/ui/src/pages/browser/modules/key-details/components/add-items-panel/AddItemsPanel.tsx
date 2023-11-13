import React from 'react'
import cx from 'classnames'
import { KeyTypes, ModulesKeyTypes, STREAM_ADD_GROUP_VIEW_TYPES } from 'uiSrc/constants'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import {
  AddHashFields,
  AddListElements,
  AddSetMembers,
  AddStreamEntries,
  AddStreamGroup,
  AddZsetMembers
} from '../key-details-add-items'

import styles from './styles.module.scss'

export interface Props {
  selectedKeyType: KeyTypes | ModulesKeyTypes
  streamViewType: StreamViewType
  closeAddItemPanel: (isCancelled?: boolean) => void
}

const AddItemsPanel = (props: Props) => {
  const {
    selectedKeyType,
    streamViewType,
    closeAddItemPanel,
  } = props

  return (
    <div className={cx('formFooterBar', styles.contentActive)}>
      {selectedKeyType === KeyTypes.Hash && (
      <AddHashFields onCancel={closeAddItemPanel} />
      )}
      {selectedKeyType === KeyTypes.ZSet && (
      <AddZsetMembers onCancel={closeAddItemPanel} />
      )}
      {selectedKeyType === KeyTypes.Set && (
      <AddSetMembers onCancel={closeAddItemPanel} />
      )}
      {selectedKeyType === KeyTypes.List && (
      <AddListElements onCancel={closeAddItemPanel} />
      )}
      {selectedKeyType === KeyTypes.Stream && (
      <>
        {streamViewType === StreamViewType.Data && (
          <AddStreamEntries onCancel={closeAddItemPanel} />
        )}
        {STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType) && (
          <AddStreamGroup onCancel={closeAddItemPanel} />
        )}
      </>
      )}
    </div>
  )
}

export { AddItemsPanel }
