import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
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

import styles from './styles.module.scss'

export interface IProps {
  onSelectedTab: (id: string) => void
  path: string
}

const JobsTree = (props: IProps) => {
  const { onSelectedTab, path } = props

  const [isExpanded, setIsExpanded] = useState(true)

  const { loading, data } = useSelector(rdiPipelineSelector)

  const renderJobsList = (jobs: any[]) => (
    jobs.map(({ name }) => (
      <EuiFlexGroup
        key={name}
        className={cx(styles.fullWidth, styles.job, { [styles.active]: path === name })}
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

  const folder = (
    <EuiFlexGroup
      className={styles.fullWidth}
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
            title="Add a job file"
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
    <EuiAccordion
      id="rdi-pipeline-jobs-nav"
      buttonContent={folder}
      initialIsOpen={isExpanded}
      onToggle={(isOpen: boolean) => setIsExpanded(isOpen)}
      className={styles.wrapper}
    >
      {/* // TODO confirm with RDI team and put sort in separate component */}
      {renderJobsList(sortBy(data?.jobs ?? [], ['name']))}
    </EuiAccordion>
  )
}

export default JobsTree
