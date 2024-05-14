import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiImage, EuiLink, EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

import EmptyListIcon from 'uiSrc/assets/img/rdi/empty_list.svg'
import NewTabIcon from 'uiSrc/assets/img/rdi/new_tab.svg'

import styles from './styles.module.scss'

const subTitleText = "Redis Data Integration (RDI) synchronizes data from your existing database into Redis in near-real-time. We've done the heavy lifting so you can turn slow data into fast data without coding."

export interface Props {
  onAddInstanceClick: () => void
}

const EmptyMessage = ({ onAddInstanceClick }: Props) => (
  <div className={styles.noResultsContainer} data-testid="empty-rdi-instance-list">
    <EuiSpacer size="xl" />
    <EuiText className={styles.title}>Redis Data Integration</EuiText>
    <EuiImage src={EmptyListIcon} className={styles.icon} alt="empty" />
    <EuiText className={styles.subTitle}>{subTitleText}</EuiText>
    <EuiFlexGroup alignItems="center">
      <EuiFlexItem>
        <EuiButton data-testid="empty-rdi-instance-button" color="secondary" fill size="s" onClick={onAddInstanceClick}>
          + Add RDI Endpoint
        </EuiButton>
      </EuiFlexItem>
      or
      <EuiFlexItem>
        <EuiLink
          data-testid="empty-rdi-quickstart-button"
          target="_blank"
          external={false}
          href="https://docs.redis.com/rdi-preview/rdi/quickstart/"
        >
          RDI Quickstart <EuiIcon type={NewTabIcon} />
        </EuiLink>
      </EuiFlexItem>
    </EuiFlexGroup>
  </div>
)

export default EmptyMessage
