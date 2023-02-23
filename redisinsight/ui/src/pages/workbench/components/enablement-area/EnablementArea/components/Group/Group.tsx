import React from 'react'
import { EuiAccordion, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'

import DeleteTutorialButton from '../DeleteTutorialButton'
import { EAItemActions } from '../../constants'

import './styles.scss'

export interface Props {
  id: string
  label: string | React.ReactElement
  actions?: string[]
  onCreate?: () => void
  onDelete?: (id: string) => void
  children: React.ReactNode
  withBorder?: boolean
  initialIsOpen?: boolean
  forceState?: 'open' | 'closed'
  arrowDisplay?: 'left' | 'right' | 'none'
  onToggle?: (isOpen: boolean) => void
  triggerStyle?: any
}

const Group = (props: Props) => {
  const {
    label,
    actions,
    children,
    id,
    forceState,
    withBorder = false,
    arrowDisplay = 'right',
    initialIsOpen = false,
    onToggle,
    onCreate,
    onDelete,
    triggerStyle,
  } = props

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreate?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const buttonContent = (
    <div className="group-header-wrapper">
      <EuiText className="group-header" size="m">
        {label}
      </EuiText>
      {actions?.includes(EAItemActions.Create) && (
        <EuiToolTip
          content="Upload Tutorial"
        >
          <div className="group-header__create-btn" role="presentation" onClick={handleCreate}>
            <EuiIcon type="plus" />
          </div>
        </EuiToolTip>
      )}
      {actions?.includes(EAItemActions.Delete) && (
        <DeleteTutorialButton id={id} label={label} onDelete={handleDelete} />
      )}
    </div>
  )
  const buttonProps: any = {
    'data-testid': `accordion-button-${id}`,
    style: triggerStyle,
  }

  return (
    <EuiAccordion
      id={id}
      data-testid={`accordion-${id}`}
      buttonContent={buttonContent}
      buttonProps={buttonProps}
      forceState={forceState}
      arrowDisplay={arrowDisplay}
      onToggle={onToggle}
      initialIsOpen={initialIsOpen}
      style={{ whiteSpace: 'nowrap', width: 'auto' }}
      className={[withBorder ? 'withBorder' : ''].join(' ')}
    >
      {children}
    </EuiAccordion>
  )
}

export default Group
