import React from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiToolTip } from '@elastic/eui'

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
    'data-testid': dataTestId
  } = props

  const handleClick = () => {
    if (length !== 1) {
      removeItem(id)
    } else {
      clearItemValues?.(id)
    }
  }

  return (
    <EuiFlexItem grow={false} style={{ width: 80 }}>
      <EuiFlexGroup
        responsive
        gutterSize="m"
        alignItems="center"
        justifyContent="center"
      >
        <div style={{ width: 60 }} className="flex-row space-between action-buttons">
          {
            !clearIsDisabled && (
              <div>
                <EuiToolTip
                  content={length === 1 ? 'Clear' : 'Remove'}
                  position="left"
                  anchorClassName={anchorClassName}
                >
                  <EuiButtonIcon
                    iconType="trash"
                    color="primary"
                    aria-label={length === 1 ? 'Clear Item' : 'Remove Item'}
                    disabled={loading}
                    onClick={handleClick}
                    data-testid="remove-item"
                  />
                </EuiToolTip>
              </div>
            )
          }
          {
            (index === length - 1) && (
              <div>
                <EuiToolTip
                  content="Add"
                  position="left"
                  anchorClassName={anchorClassName}
                >
                  <EuiButtonIcon
                    iconType="plusInCircle"
                    color="primary"
                    disabled={loading || addItemIsDisabled}
                    aria-label="Add new item"
                    onClick={addItem}
                    data-testid={dataTestId || 'add-new-item'}
                  />
                </EuiToolTip>
              </div>
            )
          }
        </div>
      </EuiFlexGroup>
    </EuiFlexItem>
  )
}

export default AddItemsActions
