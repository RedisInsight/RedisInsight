import React from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import styles from '../unsupported-type-details/styles.module.scss'

const ModulesTypeDetails = ({ moduleName = 'unsupported' }: { moduleName: string }) => {
  const history = useHistory()
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)

  const handleGoWorkbenchPage = (e: React.MouseEvent) => {
    e.preventDefault()
    history.push(Pages.workbench(connectedInstanceId))
  }

  return (
    <div className={styles.container} data-testid="modules-type-details">
      <EuiFlexGroup alignItems="center" justifyContent="center">
        <EuiFlexItem className={styles.textWrapper}>
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
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  )
}

export default ModulesTypeDetails
