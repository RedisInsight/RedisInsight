import { EuiTextColor, EuiToolTip } from '@elastic/eui'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { PageNames, Pages } from 'uiSrc/constants'
import Download from 'uiSrc/pages/rdi/pipeline/components/download/Download'
import JobsTree from 'uiSrc/pages/rdi/pipeline/components/jobs-tree'
import RefreshPipelinePopover from 'uiSrc/pages/rdi/pipeline/components/refresh-pipeline-popover'
import Tab from 'uiSrc/pages/rdi/pipeline/components/tab'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

enum RdiPipelineTabs {
  SelectMode = PageNames.rdiPipelineSelectMode,
  Config = PageNames.rdiPipelineConfig,
  Jobs = PageNames.rdiPipelineJobs,
}

interface INavItem {
  id: RdiPipelineTabs
  title: string
  fileName: string
  isShowLoader?: boolean
}

const defaultNavList: INavItem[] = [
  {
    id: RdiPipelineTabs.SelectMode,
    title: 'Select mode',
    fileName: 'Pipeline mode configuration',
  },
  {
    id: RdiPipelineTabs.Config,
    title: 'Configuration',
    fileName: 'Target connection details',
    isShowLoader: true,
  }
]

const getSelectedTab = (path: string, rdiInstanceId: string) => {
  const tabsPath = path?.replace(`${Pages.rdiPipeline(rdiInstanceId)}/`, '')

  if (tabsPath.startsWith(PageNames.rdiPipelineSelectMode)) return RdiPipelineTabs.SelectMode
  if (tabsPath.startsWith(PageNames.rdiPipelineConfig)) return RdiPipelineTabs.Config
  if (tabsPath.startsWith(PageNames.rdiPipelineJobs)) return RdiPipelineTabs.Jobs

  return null
}

const Navigation = () => {
  const [selectedTab, setSelectedTab] = useState<Nullable<RdiPipelineTabs>>(null)

  const { loading, mode, data: pipeline } = useSelector(rdiPipelineSelector)

  const history = useHistory()
  const { pathname } = useLocation()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const path = pathname?.split('/').pop() || ''

  const onSelectedTabChanged = (id: string | RdiPipelineTabs) => {
    if (!mode) {
      return
    }

    switch (id) {
      case RdiPipelineTabs.SelectMode: {
        history.push(Pages.rdiPipelineSelectMode(rdiInstanceId))
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

  useEffect(() => {
    // redirect if there is no selected pipeline mode
    if (pipeline && !mode) {
      history.push(Pages.rdiPipelineSelectMode(rdiInstanceId))
    }
  }, [pipeline])

  const renderTabs = () => (
    <>
      {defaultNavList.map(({ id, title, fileName, isShowLoader = false }) => (
        <EuiToolTip
          content={id !== RdiPipelineTabs.SelectMode && !mode ? 'Select a pipeline mode to deploy your pipeline.' : ''}
        >
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
              isDisabled={id !== RdiPipelineTabs.SelectMode && !mode}
            />
          </div>
        </EuiToolTip>

      ))}
      <EuiToolTip
        content={!mode ? 'Select a pipeline mode to deploy your pipeline.' : ''}
      >
        <Tab
          title="Data Transformation"
          isSelected={selectedTab === RdiPipelineTabs.Jobs}
          data-testid="rdi-pipeline-tab-jobs"
          isDisabled={!mode}
        >
          <JobsTree onSelectedTab={onSelectedTabChanged} path={decodeURIComponent(path)} isDisabled={!mode} />
        </Tab>
      </EuiToolTip>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <EuiTextColor component="div">Pipeline Management</EuiTextColor>
        <div className={styles.actions}>
          <RefreshPipelinePopover />
          <Download />
        </div>
      </div>
      <div className={styles.tabs} data-testid="rdi-pipeline-tabs">{renderTabs()}</div>
    </div>
  )
}

export default Navigation
