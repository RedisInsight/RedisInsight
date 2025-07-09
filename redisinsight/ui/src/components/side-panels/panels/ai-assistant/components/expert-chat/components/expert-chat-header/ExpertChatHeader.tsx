import React, { useState } from 'react'
import { EuiPopover } from '@elastic/eui'
import cx from 'classnames'

import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { RiTooltip } from 'uiSrc/components'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
} from 'uiSrc/slices/panels/sidePanels'
import { RestartChat } from 'uiSrc/components/side-panels/panels/ai-assistant/components/shared'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { EraserIcon, LightBulbIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  connectedInstanceName?: string
  databaseId: string
  isClearDisabled?: boolean
  onRestart: () => void
}

const ExpertChatHeader = (props: Props) => {
  const { databaseId, connectedInstanceName, isClearDisabled, onRestart } =
    props
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
      },
    })
  }

  return (
    <div className={styles.header}>
      {connectedInstanceName ? (
        <RiTooltip content={connectedInstanceName}>
          <Text size="xs" className="truncateText">
            {connectedInstanceName}
          </Text>
        </RiTooltip>
      ) : (
        <span />
      )}
      <div className={styles.headerActions}>
        <RiTooltip
          content={
            isTutorialsPopoverOpen
              ? undefined
              : 'Open relevant tutorials to learn more'
          }
          position="bottom"
        >
          <EuiPopover
            ownFocus
            initialFocus={false}
            className={styles.popoverAnchor}
            panelClassName={cx('popoverLikeTooltip', styles.popover)}
            anchorClassName={styles.popoverAnchor}
            anchorPosition="downLeft"
            isOpen={isTutorialsPopoverOpen}
            panelPaddingSize="m"
            closePopover={() => setIsTutorialsPopoverOpen(false)}
            focusTrapProps={{ scrollLock: true }}
            button={
              <EmptyButton
                icon={LightBulbIcon}
                size="small"
                onClick={() => setIsTutorialsPopoverOpen(true)}
                className={cx(styles.headerBtn)}
                data-testid="ai-expert-tutorial-btn"
              />
            }
          >
            <>
              <Text>
                Open relevant tutorials to learn more about search and query.
              </Text>
              <Spacer size="s" />
              <PrimaryButton
                size="s"
                onClick={handleOpenTutorials}
                className={styles.openTutorialsBtn}
                data-testid="ai-expert-open-tutorials"
              >
                Open tutorials
              </PrimaryButton>
            </>
          </EuiPopover>
        </RiTooltip>
        <RestartChat
          button={
            <EmptyButton
              disabled={isClearDisabled}
              icon={EraserIcon}
              size="small"
              className={styles.headerBtn}
              data-testid="ai-expert-restart-session-btn"
            />
          }
          onConfirm={onRestart}
        />
      </div>
    </div>
  )
}

export default ExpertChatHeader
