import React from 'react'
import { EuiPanel, EuiText } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  changeSelectedTab,
  changeSidePanel,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import BulbImg from 'uiSrc/assets/img/workbench/bulb.svg'
import ArrowToGuidesIcon from 'uiSrc/assets/img/workbench/arrow-to-guides.svg?react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { LightBulbIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import styles from './styles.module.scss'

const WbNoResultsMessage = () => {
  const { provider } = useSelector(connectedInstanceSelector)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleOpenInsights = () => {
    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: instanceId,
        provider,
        source: 'workbench',
      },
    })
  }

  return (
    <div className={styles.noResults} data-testid="wb_no-results">
      <EuiText
        className={styles.noResultsTitle}
        data-testid="wb_no-results__title"
      >
        No results to display yet
      </EuiText>
      <Title style={{ marginTop: 12, fontSize: 28 }}>
        This is our advanced CLI
      </Title>
      <Title style={{ marginTop: 6, fontSize: 20, lineHeight: 1.2 }}>
        for Redis commands.
      </Title>
      <Spacer />

      <EuiPanel
        className={styles.noResultsPanel}
        hasShadow={false}
        grow={false}
      >
        <ArrowToGuidesIcon className={styles.arrowToGuides} />
        <Row gap="m" responsive>
          <FlexItem>
            <img
              className={styles.noResultsIcon}
              src={BulbImg}
              alt="no results"
              data-testid="wb_no-results__icon"
            />
          </FlexItem>
          <FlexItem grow>
            <EuiText
              className={styles.noResultsText}
              data-testid="wb_no-results__summary"
            >
              Try Workbench with our interactive Tutorials to learn how Redis
              can solve your use cases.
            </EuiText>
            <Spacer size="xl" />
            <div>
              <PrimaryButton
                icon={LightBulbIcon}
                onClick={() => handleOpenInsights()}
                className={styles.exploreBtn}
                data-testid="no-results-explore-btn"
              >
                Explore
              </PrimaryButton>
            </div>
            <Spacer size="s" />
            <EuiText color="subdued" textAlign="left" size="xs">
              Or click the icon in the top right corner.
            </EuiText>
          </FlexItem>
        </Row>
      </EuiPanel>
    </div>
  )
}

export default WbNoResultsMessage
