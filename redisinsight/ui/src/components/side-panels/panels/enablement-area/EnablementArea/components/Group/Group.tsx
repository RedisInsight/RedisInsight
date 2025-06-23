import React, { useState } from 'react'
import { EuiIcon, EuiToolTip } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { EAItemActions } from 'uiSrc/constants'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { OnboardingTour } from 'uiSrc/components'
import { RiAccordion } from 'uiSrc/components/base/display/accordion/RiAccordion'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import DeleteTutorialButton from '../DeleteTutorialButton'

import './styles.scss'

export interface Props {
  id: string
  label: string
  actions?: string[]
  onCreate?: () => void
  onDelete?: (id: string) => void
  children: React.ReactNode
  withBorder?: boolean
  initialIsOpen?: boolean
  forceState?: 'open' | 'closed'
  onToggle?: (isOpen: boolean) => void
  isPageOpened?: boolean
  isShowActions?: boolean
  isShowFolder?: boolean
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
    initialIsOpen = false,
    onToggle,
    onCreate,
    onDelete,
    isPageOpened,
    isShowFolder,
  } = props
  const { deleting: deletingCustomTutorials } = useSelector(
    workbenchCustomTutorialsSelector,
  )
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const [isGroupOpen, setIsGroupOpen] = useState<boolean>(initialIsOpen)

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCreate?.()
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_IMPORT_CLICKED,
      eventData: {
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
      },
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  const handleOpen = (isOpen: boolean) => {
    if (forceState === 'open') return

    setIsGroupOpen(isOpen)
    onToggle?.(isOpen)
  }

  const actionsContent = (
    <>
      {actions?.includes(EAItemActions.Create) &&
        (isGroupOpen || forceState === 'open') && (
          <OnboardingTour
            options={ONBOARDING_FEATURES.EXPLORE_CUSTOM_TUTORIALS}
            anchorPosition="downLeft"
            anchorWrapperClassName="onboardingPopoverAnchor"
            panelClassName={cx({ hide: isPageOpened })}
            preventPropagation
          >
            <EuiToolTip content="Upload Tutorial">
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
        <DeleteTutorialButton
          id={id}
          label={label}
          onDelete={handleDelete}
          isLoading={deletingCustomTutorials}
        />
      )}
    </>
  )

  return (
    <RiAccordion
      id={id}
      data-testid={`accordion-${id}`}
      defaultOpen={initialIsOpen}
      open={forceState === 'open' || isGroupOpen}
      label={
        <Text className="group-header" size="m">
          {isShowFolder && (
            <EuiIcon
              type={isGroupOpen ? 'folderOpen' : 'folderClosed'}
              style={{ marginRight: '10px' }}
            />
          )}
          {label}
        </Text>
      }
      onOpenChange={handleOpen}
      style={{
        whiteSpace: 'nowrap',
        width: 'auto',
      }}
      className={cx({ withBorder })}
      actions={isShowActions ? actionsContent : null}
    >
      <Col gap="l">{children}</Col>
    </RiAccordion>
  )
}

export default Group
