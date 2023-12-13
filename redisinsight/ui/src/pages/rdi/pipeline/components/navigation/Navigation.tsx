import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  EuiTextColor,
  EuiText,
  EuiIcon,
} from '@elastic/eui'

import { Pages } from 'uiSrc/constants'
import JobsStructure from 'uiSrc/pages/rdi/pipeline/components/jobs-structure'
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
        history.push(Pages.rdiPipelineJobs(rdiInstanceId, id))
        break
      }
    }
  }

  const renderTabs = () => (
    <>
      {defaultNavList.map(({ id, title, fileName }) => (
        <Tab
          isSelected={path === id}
          key={id}
          data-testid={`rdi-pipeline-tab-${id}`}
        >
          <>
            <EuiText className="rdi-pipeline-nav__title" size="m">{title}</EuiText>
            <div
              className="rdi-pipeline-nav__file"
              role="button"
              tabIndex={0}
              onKeyDown={() => {}}
              onClick={() => onSelectedTabChanged(id)}
              data-testid={`rdi-nav-btn-${id}`}
            >
              <EuiIcon type="document" className="rdi-pipeline-nav__fileIcon" />
              <EuiText className="rdi-pipeline-nav__text">{fileName}</EuiText>
            </div>
          </>
        </Tab>
      ))}
      <JobsStructure
        onSelectedTab={onSelectedTabChanged}
        path={path}
      />
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
