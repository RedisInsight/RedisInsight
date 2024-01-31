import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiImage, EuiLink, EuiSpacer, EuiText } from '@elastic/eui'
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import EmptyPipelineIcon from 'uiSrc/assets/img/rdi/empty_pipeline.svg'
import NewTabIcon from 'uiSrc/assets/img/rdi/new_tab.svg'
import { Pages } from 'uiSrc/constants'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'

import styles from './styles.module.scss'

const Empty = () => {
  const { data, loading } = useSelector(rdiPipelineSelector)

  const history = useHistory()
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const isPipelineEmpty = !data?.config && !data?.jobs?.length

  if (!isPipelineEmpty) {
    history.push(Pages.rdiPipelinePrepare(rdiInstanceId))
  }

  if (loading || !isPipelineEmpty) {
    return null
  }

  return (
    <div className="content">
      <div className={styles.emptyPipelineContainer}>
        <EuiImage src={EmptyPipelineIcon} alt="empty" size="s" />
        <EuiSpacer size="xl" />
        <EuiText>No pipelines found</EuiText>
        <EuiText className={styles.subTitle}>Add your first pipeline to get started!</EuiText>
        <EuiSpacer size="m" />
        <EuiText>Piplelines are the foundation of RDI.</EuiText>
        <EuiText>Create your first pipeline to start exploring RDI capabilities.</EuiText>
        <EuiSpacer size="l" />
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiButton
              data-testid="create-pipeline-btn"
              color="secondary"
              fill
              size="s"
              onClick={() => {
                history.push(Pages.rdiPipelinePrepare(rdiInstanceId))
              }}
            >
              Create Pipeline
            </EuiButton>
          </EuiFlexItem>
          or
          <EuiFlexItem>
            <EuiButton data-testid="upload-pipeline-btn" size="s" onClick={() => {}}>
              Open from file
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="l" />
        <EuiLink
          data-testid="empty-rdi-quickstart-button"
          target="_blank"
          external={false}
          href="https://docs.redis.com/rdi-preview/rdi/quickstart/"
        >
          Read More <EuiIcon type={NewTabIcon} />
        </EuiLink>
      </div>
    </div>
  )
}

export default Empty
