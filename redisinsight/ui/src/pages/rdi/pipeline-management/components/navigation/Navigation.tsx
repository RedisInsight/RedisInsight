import { EuiButtonIcon, EuiTextColor } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { PageNames, Pages } from 'uiSrc/constants'
import Download from 'uiSrc/pages/rdi/pipeline-management/components/download/Download'
import JobsTree from 'uiSrc/pages/rdi/pipeline-management/components/jobs-tree'
import RefreshPipelinePopover from 'uiSrc/pages/rdi/pipeline-management/components/refresh-pipeline-popover'
import Tab from 'uiSrc/pages/rdi/pipeline-management/components/tab'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces/rdi'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

const getSelectedTab = (path: string, rdiInstanceId: string) => {
  const tabsPath = path?.replace(`${Pages.rdiPipelineManagement(rdiInstanceId)}/`, '')

  if (tabsPath.startsWith(PageNames.rdiPipelineConfig)) return RdiPipelineTabs.Config
  if (tabsPath.startsWith(PageNames.rdiPipelineJobs)) return RdiPipelineTabs.Jobs

  return null
}

const Navigation = () => {
  const [selectedTab, setSelectedTab] = useState<Nullable<RdiPipelineTabs>>(null)

  const { loading } = useSelector(rdiPipelineSelector)

  const history = useHistory()
  const { pathname } = useLocation()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const path = pathname?.split('/').pop() || ''

  const onSelectedTabChanged = (id: string | RdiPipelineTabs) => {
    if (id === RdiPipelineTabs.Config) {
      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
      return
    }

    history.push(Pages.rdiPipelineJobs(rdiInstanceId, encodeURIComponent(id)))
  }

  useEffect(() => {
    const activeTab = getSelectedTab(pathname, rdiInstanceId)
    setSelectedTab(activeTab)
  }, [pathname, rdiInstanceId])

  const renderTabs = () => (
    <>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
        onClick={() => onSelectedTabChanged(RdiPipelineTabs.Config)}
        className={styles.tab}
        data-testid={`rdi-nav-btn-${RdiPipelineTabs.Config}`}
      >
        <Tab
          title="Configure pipeline"
          fileName="Configuration file"
          isSelected={selectedTab === RdiPipelineTabs.Config}
          data-testid={`rdi-pipeline-tab-${RdiPipelineTabs.Config}`}
          isLoading={loading}
        />
      </div>
      <Tab
        title="Add transformation jobs"
        isSelected={selectedTab === RdiPipelineTabs.Jobs}
        data-testid="rdi-pipeline-tab-jobs"
      >
        <JobsTree onSelectedTab={onSelectedTabChanged} path={decodeURIComponent(path)} rdiInstanceId={rdiInstanceId} />
      </Tab>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <EuiTextColor component="div">Pipeline Management</EuiTextColor>
        <div className={styles.actions}>
          <RefreshPipelinePopover />
          <UploadModal>
            <EuiButtonIcon
              size="xs"
              iconSize="s"
              iconType="importAction"
              aria-labelledby="Upload pipeline button"
              data-testid="upload-pipeline-btn"
            />
          </UploadModal>
          <Download />
        </div>
      </div>
      <div className={styles.tabs} data-testid="rdi-pipeline-tabs">
        {renderTabs()}
      </div>
    </div>
  )
}

export default Navigation
