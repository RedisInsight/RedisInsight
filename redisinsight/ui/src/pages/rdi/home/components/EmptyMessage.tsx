import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiImage, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'

import EmptyListIcon from 'uiSrc/assets/img/rdi/empty_list.svg'
import NewTabIcon from 'uiSrc/assets/img/rdi/new_tab.svg'
import RedisDbIcon from 'uiSrc/assets/img/rdi/redis_db.svg'
import RocketIcon from 'uiSrc/assets/img/rdi/rocket.svg'

import styles from './styles.module.scss'

const EmptyMessage = () => {
  const moreInfoPanels = [
    {
      icon: RedisDbIcon,
      title: 'Setting up RDI Server',
      description: 'In order to start creating pipelines you need to set up an RDI Server',
      link: ''
    },
    {
      icon: RocketIcon,
      title: 'RDI Quickstart',
      description: 'Read about RDI and learn how to get started',
      link: ''
    }
  ]

  return (
    <div className={styles.noResultsContainer} data-testid="empty-rdi-instance-list">
      <EuiImage src={EmptyListIcon} alt="empty" size="m" />
      <EuiSpacer size="xl" />
      <EuiText>No RDI instances added</EuiText>
      <EuiText className={styles.subTitle}>Add your first RDI instance to get started!</EuiText>
      <EuiText>More info</EuiText>
      <EuiSpacer size="s" />
      <EuiFlexGroup className={styles.moreInfoContainer} gutterSize="m">
        {moreInfoPanels.map((panel) => (
          <EuiFlexItem key={panel.title}>
            <EuiPanel className={styles.moreInfoPanel} paddingSize="m" hasShadow={false} onClick={() => {}}>
              <EuiFlexGroup gutterSize="m" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiIcon size="xxl" type={panel.icon} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText className={styles.moreInfoTitle}>{panel.title}</EuiText>
                  <EuiText className={styles.moreInfoDescription}>{panel.description}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiIcon type={NewTabIcon} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </div>
  )
}

export default EmptyMessage
