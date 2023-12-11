import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  EuiTextColor,
  EuiText,
  EuiTab,
  EuiTabs,
  EuiIcon,
} from '@elastic/eui'
import cx from 'classnames'

import { Pages } from 'uiSrc/constants'
import { ReactComponent as FileIcon } from 'uiSrc/assets/img/icons/file.svg'

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

  // TODO resolve job id
  const onSelectedTabChanged = (id: string) => {
    if (id === RdiPipelineNav.Prepare) {
      history.push(Pages.rdiPipelinePrepare(rdiInstanceId))
    }
    if (id === RdiPipelineNav.Config) {
      history.push(Pages.rdiPipelineConfig(rdiInstanceId))
    }
  }

  const renderTabs = () => defaultNavList.map(({ id, title, fileName }) => (
    <EuiTab
      isSelected={path === id}
      key={id}
      className={styles.tab}
      data-testid={`rdi-pipeline-tab-${id}`}
    >
      <>
        <EuiText className={styles.tabTitle} size="m">{title}</EuiText>
        <div
          className={styles.file}
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
          onClick={() => onSelectedTabChanged(id)}
          data-testid={`rdi-nav-btn-${id}`}
        >
          <EuiIcon type={FileIcon} className={styles.fileIcon} />
          <EuiText className={styles.text}>{fileName}</EuiText>
        </div>
      </>
    </EuiTab>
  ))

  return (
    <div className={styles.wrapper}>
      <EuiTextColor className={styles.title} component="div">Pipeline Management</EuiTextColor>
      <EuiTabs className={cx('tabs-active-borders', styles.tabs)} data-testid="rdi-pipeline-tabs">{renderTabs()}</EuiTabs>
    </div>
  )
}

export default Navigation
