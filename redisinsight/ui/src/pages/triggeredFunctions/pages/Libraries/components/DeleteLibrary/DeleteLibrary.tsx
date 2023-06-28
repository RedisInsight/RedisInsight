import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiButton, EuiButtonIcon, EuiPopover, EuiText, EuiSpacer } from '@elastic/eui'

import { deleteTriggeredFunctionsLibraryAction, triggeredFunctionsLibrariesSelector } from 'uiSrc/slices/triggeredFunctions/triggeredFunctions'
import { TriggeredFunctionsLibrary, TriggeredFunctionsLibraryDetails } from 'uiSrc/slices/interfaces/triggeredFunctions'
import { formatLongName, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

export interface Props {
  library: Nullable<TriggeredFunctionsLibrary> | Nullable<TriggeredFunctionsLibraryDetails>
  isOpen: boolean
  openPopover: (library: string) => void
  onDelete: (name: string) => void
  closePopover: () => void
}

const DeleteLibraryButton = (props: Props) => {
  const { library, onDelete, isOpen, closePopover, openPopover } = props

  const { deleting } = useSelector(triggeredFunctionsLibrariesSelector)

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()
  const { name = '', pendingJobs = 0 } = library || {}

  const handleClickDelete = () => {
    openPopover(name)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DELETE_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const onSuccess = (name: string) => {
    onDelete(name)
    sendEventTelemetry({
      event: TelemetryEvent.TRIGGERS_AND_FUNCTIONS_LIBRARY_DELETED,
      eventData: {
        databaseId: instanceId,
        pendingJobs,
      }
    })
  }

  const handleDelete = () => {
    dispatch(deleteTriggeredFunctionsLibraryAction(instanceId, name, onSuccess))
    closePopover()
  }

  return (
    <EuiPopover
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      closePopover={closePopover}
      panelPaddingSize="l"
      panelClassName={styles.deletePopover}
      button={(
        <EuiButtonIcon
          iconType="trash"
          color="primary"
          aria-label="Delete Library"
          className="deleteKeyBtn"
          onClick={handleClickDelete}
          data-testid={`delete-library-icon-${name}`}
        />
      )}
      onClick={(e) => e.stopPropagation()}
      data-testid={`delete-library-popover-${name}`}
    >
      <div>
        <EuiText size="m">
          <h4 style={{ wordBreak: 'break-all' }} data-testid="delete-library-name">
            <b>{formatLongName(name)}</b>
          </h4>
          <EuiText size="s">
            and all its functions will be deleted.
          </EuiText>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiButton
          fill
          size="s"
          color="warning"
          iconType="trash"
          onClick={handleDelete}
          isLoading={deleting}
          data-testid={`delete-library-${name}`}
        >
          Delete
        </EuiButton>
      </div>
    </EuiPopover>
  )
}

export default DeleteLibraryButton
