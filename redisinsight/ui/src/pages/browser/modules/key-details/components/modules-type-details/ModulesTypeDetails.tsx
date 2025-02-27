import React from 'react'
import { EuiText, EuiTitle } from '@elastic/eui'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import styles from './styles.module.scss'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

type ModulesTypeDetailsProps = {
  moduleName: string, 
  onClose: () => void,
}
const ModulesTypeDetails = ({ moduleName = 'unsupported', onClose }: ModulesTypeDetailsProps) => {
  const history = useHistory()
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)

  const handleGoWorkbenchPage = (e: React.MouseEvent) => {
    e.preventDefault()
    history.push(Pages.workbench(connectedInstanceId))
  }

  return (
    <TextDetailsWrapper onClose={onClose} testid="modules-type">
      <EuiTitle>
        <h4>{`This is a ${moduleName} key.`}</h4>
      </EuiTitle>
      <EuiText size="s">
        {'Use Redis commands in the '}
        <a
          tabIndex={0}
          onClick={handleGoWorkbenchPage}
          className={styles.link}
          data-testid="internal-workbench-link"
          onKeyDown={() => ({})}
          role="link"
          rel="noreferrer"
        >
          Workbench
        </a>
        {' tool to view the value.'}
      </EuiText>
    </TextDetailsWrapper>
  )
}

export default ModulesTypeDetails
