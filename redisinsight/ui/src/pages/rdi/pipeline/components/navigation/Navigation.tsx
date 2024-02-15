import { EuiButtonIcon, EuiTextColor } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { PageNames, Pages } from 'uiSrc/constants'
import Download from 'uiSrc/pages/rdi/pipeline/components/download/Download'
import JobsTree from 'uiSrc/pages/rdi/pipeline/components/jobs-tree'
import RefreshPipelinePopover from 'uiSrc/pages/rdi/pipeline/components/refresh-pipeline-popover'
import Tab from 'uiSrc/pages/rdi/pipeline/components/tab'
import UploadModal from 'uiSrc/pages/rdi/pipeline/components/upload-modal/UploadModal'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

enum RdiPipelineTabs {
  Prepare = PageNames.rdiPipelinePrepare,
  Config = PageNames.rdiPipelineConfig,
  Jobs = PageNames.rdiPipelineJobs
}

interface INavItem {
  id: RdiPipelineTabs
  title: string
  fileName: string
  isShowLoader?: boolean
}

const defaultNavList: INavItem[] = [
  {
    id: RdiPipelineTabs.Prepare,
    title: 'Prepare',
    fileName: 'Select pipeline type'
  },
  {
    id: RdiPipelineTabs.Config,
    title: 'Configuration',
    fileName: 'Target connection details',
    isShowLoader: true
  }
]

const getSelectedTab = (path: string, rdiInstanceId: string) => {
  const tabsPath = path?.replace(`/${Pages.rdiPipeline(rdiInstanceId)}/`, '')

  if (tabsPath.startsWith(PageNames.rdiPipelinePrepare)) return RdiPipelineTabs.Prepare
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
    switch (id) {
      case RdiPipelineTabs.Prepare: {
        history.push(Pages.rdiPipelinePrepare(rdiInstanceId))
        break
      }
      case RdiPipelineTabs.Config: {
        history.push(Pages.rdiPipelineConfig(rdiInstanceId))
        break
      }
      default: {
        history.push(Pages.rdiPipelineJobs(rdiInstanceId, encodeURIComponent(id)))
        break
      }
    }
  }

  useEffect(() => {
    const activeTab = getSelectedTab(pathname, rdiInstanceId)
    setSelectedTab(activeTab)
  }, [pathname, rdiInstanceId])

  const renderTabs = () => (
    <>
      {defaultNavList.map(({ id, title, fileName, isShowLoader = false }) => (
        <div
          key={id}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          onClick={() => onSelectedTabChanged(id)}
          className={styles.tab}
          data-testid={`rdi-nav-btn-${id}`}
        >
          <Tab
            title={title}
            fileName={fileName}
            isSelected={selectedTab === id}
            data-testid={`rdi-pipeline-tab-${id}`}
            isLoading={loading && isShowLoader}
          />
        </div>
      ))}
      <Tab
        title="Transform and Validate"
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
