import { EuiButton, EuiCheckbox, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { setDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import styles from '../styles.module.scss'

interface Props {
  onApply: () => void
}

const RunConfirmationPopover = ({ onApply }: Props) => {
  const [notShowAgain, setNotShowAgain] = useState(false)

  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const handleChangeDatabase = () => {
    history.push(Pages.home)
    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_DATABASE_CHANGE_CLICKED,
      eventData: {
        databaseId: instanceId,
      }
    })
  }

  const handleApply = () => {
    if (notShowAgain) {
      setDBConfigStorageField(instanceId, ConfigDBStorageItem.notShowConfirmationRunTutorial, true)
    }
    onApply?.()
  }

  return (
    <>
      <EuiTitle size="xxs">
        <span>Run commands</span>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiText size="s">
        This tutorial will change data in your database, are you sure you want to run commands in this database?
      </EuiText>
      <EuiSpacer size="s" />
      <EuiCheckbox
        id="showAgain"
        name="showAgain"
        label="Don't show again for this database"
        checked={notShowAgain}
        className={styles.showAgainCheckBox}
        onChange={(e) => setNotShowAgain(e.target.checked)}
        data-testid="checkbox-show-again"
        aria-label="checkbox do not show agan"
      />
      <div className={styles.popoverFooter}>
        <div>
          <EuiButton
            color="secondary"
            size="s"
            className={styles.popoverBtn}
            onClick={handleChangeDatabase}
            data-testid="tutorial-popover-change-db"
          >
            Change Database
          </EuiButton>
          <EuiButton
            color="secondary"
            fill
            size="s"
            className={styles.popoverBtn}
            onClick={handleApply}
            data-testid="tutorial-popover-apply-run"
          >
            Run
          </EuiButton>
        </div>
      </div>
    </>
  )
}

export default RunConfirmationPopover
