import {
  EuiAccordion,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiTextColor,
  EuiToolTip
} from '@elastic/eui'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { IPipeline, IRdiPipelineJob } from 'uiSrc/slices/interfaces'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { Nullable } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface IProps {
  onSelectedTab: (id: string) => void
  path: string
}

const validateJobName = (jobName: Nullable<string>, jobs: IRdiPipelineJob[]) => {
  if (!jobName) {
    return { title: '', text: 'job name is required' }
  }

  if (jobs.some((job) => job.name === jobName)) {
    return { title: '', text: 'job name must be unique' }
  }

  return undefined
}

const JobsTree = (props: IProps) => {
  const { onSelectedTab, path } = props

  const [isExpanded, setIsExpanded] = useState(true)
  const [editJobName, setEditJobName] = useState<Nullable<string>>(null)
  const [editJobIndex, setEditJobIndex] = useState<Nullable<number>>(null)
  const [isNewJob, setIsNewJob] = useState(false)

  const { loading } = useSelector(rdiPipelineSelector)

  const { values, setFieldValue } = useFormikContext<IPipeline>()

  const isEditing = (index: number) => editJobIndex === index

  const jobName = (name: string, index: number) => (
    <>
      <EuiFlexItem
        grow
        onClick={() => onSelectedTab(name)}
        className={cx(styles.navItem, 'truncateText')}
        data-testid={`rdi-nav-job-${name}`}
      >
        {name}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiToolTip title="Edit job file name" position="top" display="inlineBlock" anchorClassName="flex-row">
          <EuiButtonIcon
            iconType="pencil"
            onClick={() => {
              onSelectedTab(name)
              setEditJobIndex(index)
              setEditJobName(name)
              setIsNewJob(false)
            }}
            aria-label="edit job file name"
            data-testid="edit-job-name"
          />
        </EuiToolTip>
      </EuiFlexItem>
    </>
  )

  const jobNameEditor = (name: string, index: number) => (
    <EuiFlexItem className={styles.inputContainer} data-testid={`rdi-nav-job-edit-${name}`}>
      <InlineItemEditor
        controlsPosition="right"
        onApply={() => {
          setFieldValue(`jobs.${index}.name`, editJobName)
          setEditJobIndex(null)
          setEditJobName(null)

          if (editJobName) {
            onSelectedTab(editJobName)
          }
        }}
        onDecline={() => {
          setEditJobIndex(null)
          setEditJobName(null)

          if (isNewJob) {
            setFieldValue(
              'jobs',
              values.jobs.filter((_, i) => i !== index)
            )
          }
        }}
        isDisabled={!!validateJobName(editJobName, values.jobs)}
        disabledTooltipText={validateJobName(editJobName, values.jobs)}
        isLoading={loading}
        declineOnUnmount={false}
        controlsClassName={styles.controls}
        formComponentType="div"
      >
        <EuiFieldText
          data-testid={`job-name-input-${index}`}
          className={styles.input}
          maxLength={250}
          isLoading={loading}
          autoComplete="off"
          value={editJobName ?? ''}
          placeholder="Enter job name"
          onChange={(e) => {
            setEditJobName(e.target.value)
          }}
        />
      </InlineItemEditor>
    </EuiFlexItem>
  )

  const renderJobsList = (jobs: IRdiPipelineJob[]) =>
    jobs.map(({ name }, index) => (
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
            <EuiIcon type="document" className={styles.fileIcon} data-test-subj="jobs-folder-icon-close" />
          </EuiFlexItem>
          {isEditing(index) ? jobNameEditor(name, index) : jobName(name, index)}
        </EuiFlexGroup>
      </EuiFlexGroup>
    ))

  const folder = () => (
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
              {values?.jobs?.length ? `(${values?.jobs?.length})` : ''}
            </EuiTextColor>
          )}
          {loading && <EuiLoadingSpinner data-testid="rdi-nav-jobs-loader" className={styles.loader} />}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexGroup>
  )

  return (
    <EuiAccordion
      id="rdi-pipeline-jobs-nav"
      buttonContent={folder()}
      initialIsOpen={isExpanded}
      onToggle={(isOpen: boolean) => setIsExpanded(isOpen)}
      className={styles.wrapper}
      extraAction={(
        <EuiToolTip title="Add a job file" position="top" display="inlineBlock" anchorClassName="flex-row">
          <EuiButtonIcon
            iconType="plus"
            onClick={() => {
              setFieldValue('jobs', [{ name: '', value: '' }, ...values.jobs])
              setEditJobIndex(0)
              setIsNewJob(true)
            }}
            aria-label="add new job file"
            data-testid="add-new-job"
          />
        </EuiToolTip>
      )}
    >
      {/* // TODO confirm with RDI team and put sort in separate component */}
      {renderJobsList(values?.jobs ?? [])}
    </EuiAccordion>
  )
}

export default JobsTree
