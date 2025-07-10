import React from 'react'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { PlusInCircleIcon, DeleteIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'

export interface Props {
  id: number
  length: number
  index: number
  loading: boolean
  removeItem: (id: number) => void
  addItem: () => void
  anchorClassName?: string
  clearItemValues?: (id: number) => void
  clearIsDisabled?: boolean
  addItemIsDisabled?: boolean
  'data-testid'?: string
}

const AddItemsActions = (props: Props) => {
  const {
    id,
    length,
    loading,
    removeItem,
    index,
    addItem,
    anchorClassName,
    clearItemValues,
    clearIsDisabled,
    addItemIsDisabled,
    'data-testid': dataTestId,
  } = props

  const handleClick = () => {
    if (length !== 1) {
      removeItem(id)
    } else {
      clearItemValues?.(id)
    }
  }

  return (
    <FlexItem style={{ width: 80 }}>
      <Row responsive gap="m" centered>
        <div
          style={{ width: 60 }}
          className="flex-row space-between action-buttons"
        >
          {!clearIsDisabled && (
            <div>
              <RiTooltip
                content={length === 1 ? 'Clear' : 'Remove'}
                position="left"
                anchorClassName={anchorClassName}
              >
                <IconButton
                  icon={DeleteIcon}
                  aria-label={length === 1 ? 'Clear Item' : 'Remove Item'}
                  disabled={loading}
                  onClick={handleClick}
                  data-testid="remove-item"
                />
              </RiTooltip>
            </div>
          )}
          {index === length - 1 && (
            <div>
              <RiTooltip
                content="Add"
                position="left"
                anchorClassName={anchorClassName}
              >
                <IconButton
                  icon={PlusInCircleIcon}
                  disabled={loading || addItemIsDisabled}
                  aria-label="Add new item"
                  onClick={addItem}
                  data-testid={dataTestId || 'add-new-item'}
                />
              </RiTooltip>
            </div>
          )}
        </div>
      </Row>
    </FlexItem>
  )
}

export default AddItemsActions
