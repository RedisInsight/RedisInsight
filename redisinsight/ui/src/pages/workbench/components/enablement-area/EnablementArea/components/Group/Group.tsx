import React from 'react'
import { EuiAccordion, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import DeleteTutorialButton from '../DeleteTutorialButton'
import { EAItemActions } from '../../constants'

import './styles.scss'

export interface Props {
  id: string
  label: string
  actions?: string[]
  isShowActions?: boolean
  onCreate?: () => void
  onDelete?: (id: string) => void
  children: React.ReactNode
  withBorder?: boolean
  initialIsOpen?: boolean
  forceState?: 'open' | 'closed'
  arrowDisplay?: 'left' | 'right' | 'none'
  onToggle?: (isOpen: boolean) => void
  triggerStyle?: any
  isCustomTutorialsLoading?: boolean
}

const Group = (props: Props) => {
  const {
    label,
    actions,
    isShowActions,
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
  const { deleting: deletingCustomTutorials } = useSelector(workbenchCustomTutorialsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  if (isShowActions) {
    console.log(children)
  }

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreate?.()
    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_IMPORT_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const actionsContent = (
    <>
      {actions?.includes(EAItemActions.Create) && (
        <EuiToolTip
          content="Upload Tutorial"
        >
          <div
            className="group-header__btn group-header__create-btn"
            role="presentation"
            onClick={handleCreate}
            data-testid="open-upload-tutorial-btn"
          >
            <EuiIcon type="plus" />
          </div>
        </EuiToolTip>
      )}
      {actions?.includes(EAItemActions.Delete) && (
        <DeleteTutorialButton id={id} label={label} onDelete={handleDelete} isLoading={deletingCustomTutorials} />
      )}
    </>
  )

  const buttonContent = (
    <div className="group-header-wrapper">
      <EuiText className="group-header" size="m">
        {label}
      </EuiText>
      {isShowActions && actionsContent}
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
