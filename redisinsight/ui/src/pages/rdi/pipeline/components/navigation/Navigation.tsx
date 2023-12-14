import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { EuiTextColor } from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import JobsTree from 'uiSrc/pages/rdi/pipeline/components/jobs-tree'
import Tab from 'uiSrc/pages/rdi/pipeline/components/tab'

import styles from './styles.module.scss'

export interface IProps {
  path: string
}

enum RdiPipelineNav {
  Prepare = 'prepare',
  Config = 'config',
}

const defaultNavList = [
  {
    id: RdiPipelineNav.Prepare,
    title: 'Prepare',
    fileName: 'Select pipeline type',
  },
  {
    id: RdiPipelineNav.Config,
    title: 'Configuration',
    fileName: 'Target connection details'
  }
]

const Navigation = (props: IProps) => {
  const { path } = props

  const { data } = useSelector(rdiPipelineSelector)

  const history = useHistory()

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const onSelectedTabChanged = (id: string) => {
    switch (id) {
      case RdiPipelineNav.Prepare: {
        history.push(Pages.rdiPipelinePrepare(rdiInstanceId))
        break
      }
      case RdiPipelineNav.Config: {
        history.push(Pages.rdiPipelineConfig(rdiInstanceId))
        break
      }
      default: {
        history.push(Pages.rdiPipelineJobs(rdiInstanceId, encodeURIComponent(id)))
        break
      }
    }
  }

  const renderTabs = () => (
    <>
      {defaultNavList.map(({ id, title, fileName }) => (
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
            isSelected={path === id}
            data-testid={`rdi-pipeline-tab-${id}`}
          />
        </div>
      ))}
      <Tab
        title="Data Transformation"
        isSelected={!!data?.jobs.some(({ name }) => name === decodeURIComponent(path))}
        data-testid="rdi-pipeline-tab-jobs"
      >
        <JobsTree onSelectedTab={onSelectedTabChanged} path={decodeURIComponent(path)} />
      </Tab>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <EuiTextColor className={styles.title} component="div">Pipeline Management</EuiTextColor>
      <div className={styles.tabs} data-testid="rdi-pipeline-tabs">{renderTabs()}</div>
    </div>
  )
}

export default Navigation
