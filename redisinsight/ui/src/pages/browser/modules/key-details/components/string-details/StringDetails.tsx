import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  refreshKey,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'
import { StringDetailsTable } from './string-details-table'

export interface Props extends KeyDetailsHeaderProps {}

const StringDetails = (props: Props) => {
  const keyType = KeyTypes.String

  const { loading } = useSelector(selectedKeySelector)
  const [editItem, setEditItem] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleRefreshKey = (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes, args: IFetchKeyArgs) => {
    dispatch(refreshKey(key, type, args))
  }

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        onEditItem={() => setEditItem(!editItem)}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <StringDetailsTable
              isEditItem={editItem}
              setIsEdit={(isEdit: boolean) => setEditItem(isEdit)}
              onRefresh={handleRefreshKey}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export { StringDetails }
