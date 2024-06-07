import React, { useState } from 'react'
import { EuiButtonIcon, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  initialValue?: string
  field?: string
  placeholder?: string
  isEditing: boolean
  isEditDisabled?: boolean
  onEdit: (isEditing: boolean) => void
  validation?: (value: string) => string
  editToolTipContent?: React.ReactNode
  onDecline: (event?: React.MouseEvent<HTMLElement>) => void
  onApply: (value: string, event: React.MouseEvent) => void
  testIdPrefix?: string
}

const EditableInput = (props: Props) => {
  const {
    children,
    initialValue = '',
    field,
    placeholder,
    isEditing,
    isEditDisabled,
    editToolTipContent,
    validation,
    onEdit,
    onDecline,
    onApply,
    testIdPrefix = '',
  } = props

  const [isHovering, setIsHovering] = useState(false)

  if (!isEditing) {
    return (
      <div
        className={styles.contentWrapper}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-testid={`${testIdPrefix}_content-value-${field}`}
      >
        <EuiText color="subdued" size="s" style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}>
          <div
            style={{ display: 'flex' }}
          >
            {children}
          </div>
        </EuiText>
        {isHovering && (
          <EuiToolTip
            content={editToolTipContent}
            anchorClassName={styles.editBtnAnchor}
            data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
          >
            <EuiButtonIcon
              iconType="pencil"
              aria-label="Edit field"
              className={cx('editFieldBtn', styles.editBtn)}
              color="primary"
              isDisabled={isEditDisabled}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onEdit?.(true)
                setIsHovering(false)
              }}
              data-testid={`${testIdPrefix}_edit-btn-${field}`}
            />
          </EuiToolTip>
        )}
      </div>
    )
  }

  return (
    <StopPropagation>
      <div className={styles.inputWrapper}>
        <InlineItemEditor
          initialValue={initialValue}
          controlsPosition="right"
          controlsClassName={styles.controls}
          placeholder={placeholder}
          fieldName={field}
          expandable
          iconSize="m"
          onDecline={(event) => {
            onDecline(event)
            onEdit?.(false)
          }}
          onApply={(value, event) => {
            onApply(value, event)
            onEdit?.(false)
          }}
          validation={validation}
        />
      </div>
    </StopPropagation>
  )
}

export default EditableInput
