import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  EuiText,
  EuiTextColor,
  EuiIcon,
  EuiLoadingSpinner,
  EuiFlexGroup,
  EuiFlexItem,
  EuiAccordion,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui'
import cx from 'classnames'
import { sortBy } from 'lodash'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import Tab from 'uiSrc/pages/rdi/pipeline/components/tab'

import styles from './styles.module.scss'

export interface IProps {
  onSelectedTab: (id: string) => void
  path: string
}

const JobsStructure = (props: IProps) => {
  const { onSelectedTab, path } = props

  const [isExpanded, setIsExpanded] = useState(true)

  const { loading, data } = useSelector(rdiPipelineSelector)

  const renderJobsList = (jobs: any[]) => (
    // TODO confirm with RDI team and put sort in separate component
    sortBy(jobs, ['name']).map(({ name }) => (
      <EuiFlexGroup
        className={cx(styles.fullWidth, styles.job, 'rdi-pipeline-nav__file', { [styles.active]: path === name })}
        responsive={false}
        alignItems="center"
        justifyContent="spaceBetween"
        gutterSize="none"
      >
        <EuiFlexGroup className={styles.fullWidth} alignItems="center" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiIcon
              type="document"
              className={styles.fileIcon}
              data-test-subj="jobs-folder-icon-close"
            />
          </EuiFlexItem>
          <EuiFlexItem
            grow
            onClick={() => onSelectedTab(name)}
            className={cx(styles.navItem, 'truncateText')}
            data-testid={`rdi-nav-job-${name}`}
          >
            {name}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip
              title="Edit job file name"
              position="top"
              display="inlineBlock"
              anchorClassName="flex-row"
            >
              <EuiButtonIcon
                iconType="pencil"
                onClick={() => {}}
                aria-label="edit job file name"
                data-testid="edit-job-name"
              />
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexGroup>
    ))
  )

  const buttonContent = (
    <EuiFlexGroup
      className={cx(styles.fullWidth)}
      responsive={false}
      alignItems="center"
      justifyContent="spaceBetween"
      gutterSize="none"
    >
      <EuiFlexGroup className={styles.fullWidth} alignItems="center" gutterSize="none">
        <EuiFlexItem grow={false}>
          <EuiIcon
            type={isExpanded ? 'folderOpen' : 'folderClosed'}
            className={styles.folderIcon}
            data-test-subj="jobs-folder-icon"
          />
        </EuiFlexItem>
        <EuiFlexItem grow className="truncateText">
          {'Jobs '}
          {!loading && (
            <EuiTextColor className={styles.jobsCount} component="span" data-testid="rdi-jobs-count">
              {data?.jobs.length ? `(${data?.jobs.length})` : ''}
            </EuiTextColor>
          )}
          {loading && <EuiLoadingSpinner data-testid="rdi-nav-jobs-loader" className={styles.loader} />}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip
            title="Add job file"
            position="top"
            display="inlineBlock"
            anchorClassName="flex-row"
          >
            <EuiButtonIcon
              iconType="plus"
              onClick={() => {}}
              aria-label="add new job file"
              data-testid="add-new-job"
            />
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexGroup>
  )

  return (
    <Tab
      isSelected={!!data?.jobs.some(({ name }) => name === path)}
      className={styles.wrapper}
      data-testid="rdi-pipeline-tab-jobs"
    >
      <>
        <EuiText className="rdi-pipeline-nav__title" size="m">Data Transformation</EuiText>
        <EuiAccordion
          id="rdi-pipeline-jobs-nav"
          buttonContent={buttonContent}
          initialIsOpen={isExpanded}
          onToggle={(isOpen: boolean) => setIsExpanded(isOpen)}
        >
          {renderJobsList(data?.jobs ?? [])}
        </EuiAccordion>
      </>
    </Tab>
  )
}

export default JobsStructure
