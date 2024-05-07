import React, { useState } from 'react'
import { EuiButton, EuiButtonEmpty, EuiPopover, EuiSpacer, EuiText, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'

import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import BulbIcon from 'uiSrc/assets/img/bulb.svg?react'

import { sendEventTelemetry, TELEMETRY_EMPTY_VALUE, TelemetryEvent } from 'uiSrc/telemetry'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen
} from 'uiSrc/slices/panels/sidePanels'
import { RestartChat } from 'uiSrc/components/side-panels/panels/ai-assistant/components/shared'

import styles from './styles.module.scss'

export interface Props {
  connectedInstanceName?: string
  databaseId: string
  isClearDisabled?: boolean
  onRestart: () => void
}

const ExpertChatHeader = (props: Props) => {
  const { databaseId, connectedInstanceName, isClearDisabled, onRestart } = props
  const [isTutorialsPopoverOpen, setIsTutorialsPopoverOpen] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  const handleOpenTutorials = () => {
    setIsTutorialsPopoverOpen(false)

    dispatch(resetExplorePanelSearch())
    dispatch(setExplorePanelIsPageOpen(false))
    history.push({ search: '' })

    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))

    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        databaseId: databaseId || TELEMETRY_EMPTY_VALUE,
        source: 'chatbot_tutorials_button',
      }
    })
  }

  return (
    <div className={styles.header}>
      {connectedInstanceName ? (
        <EuiToolTip
          content={connectedInstanceName}
          anchorClassName={styles.dbName}
        >
          <EuiText size="xs" className="truncateText">{connectedInstanceName}</EuiText>
        </EuiToolTip>
      ) : (<span />)}
      <div className={styles.headerActions}>
        <EuiToolTip
          content={isTutorialsPopoverOpen ? undefined : 'Open relevant tutorials to learn more'}
          anchorClassName={styles.headerBtnAnchor}
          display="block"
          position="bottom"
        >
          <EuiPopover
            ownFocus
            initialFocus={false}
            className={styles.popoverAnchor}
            panelClassName={cx('euiToolTip', 'popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            anchorPosition="downLeft"
            isOpen={isTutorialsPopoverOpen}
            panelPaddingSize="m"
            closePopover={() => setIsTutorialsPopoverOpen(false)}
            focusTrapProps={{ scrollLock: true }}
            button={(
              <EuiButtonEmpty
                iconType={BulbIcon}
                size="xs"
                onClick={() => setIsTutorialsPopoverOpen(true)}
                className={cx(styles.headerBtn)}
                data-testid="ai-expert-tutorial-btn"
              />
            )}
          >
            <>
              <EuiText>Open relevant tutorials to learn more about search and query.</EuiText>
              <EuiSpacer size="s" />
              <EuiButton
                fill
                size="s"
                color="secondary"
                onClick={handleOpenTutorials}
                className={styles.openTutorialsBtn}
                data-testid="ai-expert-open-tutorials"
              >
                Open tutorials
              </EuiButton>
            </>
          </EuiPopover>
        </EuiToolTip>
        <RestartChat
          button={(
            <EuiButtonEmpty
              disabled={isClearDisabled}
              iconType="eraser"
              size="xs"
              className={styles.headerBtn}
              data-testid="ai-expert-restart-session-btn"
            />
          )}
          onConfirm={onRestart}
        />
      </div>
    </div>
  )
}

export default ExpertChatHeader
