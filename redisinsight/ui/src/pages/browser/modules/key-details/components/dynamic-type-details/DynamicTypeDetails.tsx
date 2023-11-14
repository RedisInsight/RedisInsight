import React from 'react'
import { useDispatch } from 'react-redux'
import { KeyTypes, MODULES_KEY_TYPES_NAMES, ModulesKeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'
import { refreshKey } from 'uiSrc/slices/browser/keys'
import ZSetDetails from '../zset-details/ZSetDetails'
import SetDetails from '../set-details/SetDetails'
import StringDetails from '../string-details/StringDetails'
import HashDetails from '../hash-details/HashDetails'
import ListDetails from '../list-details/ListDetails'
import RejsonDetailsWrapper from '../rejson-details/RejsonDetailsWrapper'
import StreamDetailsWrapper from '../stream-details'
import ModulesTypeDetails from '../modules-type-details/ModulesTypeDetails'
import UnsupportedTypeDetails from '../unsupported-type-details/UnsupportedTypeDetails'

export interface Props {
  selectedKeyType: KeyTypes | ModulesKeyTypes
  isAddItemPanelOpen: boolean
  isRemoveItemPanelOpen: boolean
  editItem: boolean
  onRemoveKey: ()=> void
  setEditItem: (isEdit: boolean) => void
}

const DynamicTypeDetails = (props: Props) => {
  const {
    selectedKeyType,
    isAddItemPanelOpen,
    onRemoveKey,
    isRemoveItemPanelOpen,
    editItem,
    setEditItem,
  } = props

  const dispatch = useDispatch()

  const handleRefreshKey = (key: RedisResponseBuffer, type: KeyTypes | ModulesKeyTypes, args: IFetchKeyArgs) => {
    dispatch(refreshKey(key, type, args))
  }

  const TypeDetails: any = {
    [KeyTypes.ZSet]: <ZSetDetails isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />,
    [KeyTypes.Set]: <SetDetails isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />,
    [KeyTypes.String]: (
      <StringDetails
        isEditItem={editItem}
        setIsEdit={(isEdit) => setEditItem(isEdit)}
        onRefresh={handleRefreshKey}
      />
    ),
    [KeyTypes.Hash]: <HashDetails isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />,
    [KeyTypes.List]: <ListDetails isFooterOpen={isAddItemPanelOpen || isRemoveItemPanelOpen} />,
    [KeyTypes.ReJSON]: <RejsonDetailsWrapper />,
    [KeyTypes.Stream]: <StreamDetailsWrapper isFooterOpen={isAddItemPanelOpen} />,
  }

  // Supported key type
  if (selectedKeyType && selectedKeyType in TypeDetails) {
    return TypeDetails[selectedKeyType]
  }

  // Unsupported redis modules key type
  if (Object.values(ModulesKeyTypes).includes(selectedKeyType as ModulesKeyTypes)) {
    return <ModulesTypeDetails moduleName={MODULES_KEY_TYPES_NAMES[selectedKeyType]} />
  }

  // Unsupported key type
  if (!(Object.values(KeyTypes).includes(selectedKeyType as KeyTypes))
    && !(Object.values(ModulesKeyTypes).includes(selectedKeyType as ModulesKeyTypes))) {
    return <UnsupportedTypeDetails />
  }

  return null
}

export { DynamicTypeDetails }
