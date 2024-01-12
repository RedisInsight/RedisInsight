import React, { useState } from 'react'
import { EuiAccordion, EuiIcon, EuiText, EuiToolTip } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { EAItemActions } from 'uiSrc/constants'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { OnboardingTour } from 'uiSrc/components'
import DeleteTutorialButton from '../DeleteTutorialButton'

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
  buttonClassName?: string
  isPageOpened?: boolean
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
    buttonClassName,
    isPageOpened,
  } = props
  const { deleting: deletingCustomTutorials } = useSelector(workbenchCustomTutorialsSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const [isGroupOpen, setIsGroupOpen] = useState<boolean>(initialIsOpen)

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreate?.()
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_IMPORT_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const handleOpen = (isOpen: boolean) => {
    setIsGroupOpen(isOpen)
    onToggle?.(isOpen)
  }

  const actionsContent = (
    <>
      {actions?.includes(EAItemActions.Create) && (
        <OnboardingTour
          options={ONBOARDING_FEATURES.EXPLORE_CUSTOM_TUTORIALS}
          anchorPosition="downLeft"
          anchorWrapperClassName="onboardingPopoverAnchor"
          panelClassName={cx({ hide: isPageOpened })}
          preventPropagation
        >
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
        </OnboardingTour>
      )}
      {actions?.includes(EAItemActions.Delete) && (
        <DeleteTutorialButton id={id} label={label} onDelete={handleDelete} isLoading={deletingCustomTutorials} />
      )}
    </>
  )

  const buttonContent = (
    <div className="group-header-wrapper">
      <EuiText className="group-header" size="m">
        <EuiIcon type={isGroupOpen ? 'folderOpen' : 'folderClosed'} />
        {label}
      </EuiText>
      {isShowActions && actionsContent}
    </div>
  )

  const buttonProps: any = {
    'data-testid': `accordion-button-${id}`,
    style: triggerStyle,
    className: buttonClassName,
  }

  return (
    <EuiAccordion
      id={id}
      data-testid={`accordion-${id}`}
      buttonContent={buttonContent}
      buttonProps={buttonProps}
      forceState={forceState}
      arrowDisplay={arrowDisplay}
      onToggle={handleOpen}
      initialIsOpen={initialIsOpen}
      style={{ whiteSpace: 'nowrap', width: 'auto' }}
      className={[withBorder ? 'withBorder' : ''].join(' ')}
    >
      {children}
    </EuiAccordion>
  )
}

export default Group
