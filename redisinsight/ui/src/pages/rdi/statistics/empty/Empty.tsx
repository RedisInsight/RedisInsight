import { EuiButton, EuiImage, EuiText } from '@elastic/eui'
import React from 'react'
import { useHistory } from 'react-router-dom'

import EmptyPipelineIcon from 'uiSrc/assets/img/rdi/empty_pipeline.svg'
import { Pages } from 'uiSrc/constants'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import Panel from '../components/panel'

import styles from './styles.module.scss'

interface Props {
  rdiInstanceId: string
}

const Empty = ({ rdiInstanceId }: Props) => {
  const history = useHistory()

  return (
    <Panel>
      <div className={styles.emptyPipelineContainer} data-testid="empty-pipeline">
        <EuiImage src={EmptyPipelineIcon} alt="empty" size="s" />
        <Spacer size="xl" />
        <EuiText>No pipeline deployed yet</EuiText>
        <EuiText className={styles.subTitle}>
          Create your first pipeline to get started!
        </EuiText>
        <Spacer size="l" />
        <EuiButton
          data-testid="add-pipeline-btn"
          color="secondary"
          fill
          size="s"
          onClick={() => {
            history.push(Pages.rdiPipelineConfig(rdiInstanceId))
          }}
        >
          Add Pipeline
        </EuiButton>
      </div>
    </Panel>
  )
}

export default Empty
