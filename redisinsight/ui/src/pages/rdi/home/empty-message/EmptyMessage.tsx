import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiImage, EuiLink, EuiSpacer, EuiText } from '@elastic/eui'
import React, { useContext } from 'react'

import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import EmptyListDarkIcon from 'uiSrc/assets/img/rdi/empty_list_dark.svg'
import EmptyListLightIcon from 'uiSrc/assets/img/rdi/empty_list_light.svg'
import NewTabIcon from 'uiSrc/assets/img/rdi/new_tab.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'

import styles from './styles.module.scss'

const subTitleText = "Redis Data Integration (RDI) synchronizes data from your existing database into Redis in near-real-time. We've done the heavy lifting so you can turn slow data into fast data without coding."

export interface Props {
  onAddInstanceClick: () => void
}

const EmptyMessage = ({ onAddInstanceClick }: Props) => {
  const { theme } = useContext(ThemeContext)
  return (
    <div className={styles.noResultsContainer} data-testid="empty-rdi-instance-list">
      <EuiSpacer size="xl" />
      <EuiText className={styles.title}>Redis Data Integration</EuiText>
      <EuiImage src={theme === Theme.Dark ? EmptyListDarkIcon : EmptyListLightIcon} className={styles.icon} alt="empty" />
      <EuiText className={styles.subTitle}>{subTitleText}</EuiText>
      <EuiFlexGroup alignItems="center" style={{ lineHeight: '20px' }}>
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
            href={getUtmExternalLink(
              EXTERNAL_LINKS.rdiQuickStart,
              {
                medium: UTM_MEDIUMS.Rdi,
                campaign: 'rdi_list'
              }
            )}
          >
            RDI Quickstart <EuiIcon type={NewTabIcon} />
          </EuiLink>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default EmptyMessage
