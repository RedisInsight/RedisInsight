import React from 'react'
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle, EuiToolTip } from '@elastic/eui'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import styles from './styles.module.scss'

const ModulesTypeDetails = (
  { moduleName = 'unsupported', 
    onClose 
  }: 
    { moduleName: string, 
      onClose: () => void,
    }
  ) => {
  const history = useHistory()
  const { id: connectedInstanceId = '' } = useSelector(connectedInstanceSelector)

  const handleGoWorkbenchPage = (e: React.MouseEvent) => {
    e.preventDefault()
    history.push(Pages.workbench(connectedInstanceId))
  }

  return (
    <div className={styles.container} data-testid="modules-type-details">
      <EuiToolTip
        content="Close"
        position="left"
        anchorClassName={styles.closeRightPanel}
      >
        <EuiButtonIcon
          iconType="cross"
          color="primary"
          aria-label="Close key"
          className={styles.closeBtn}
          onClick={() => onClose()}
          data-testid="module-type-close-key-btn"
        />
      </EuiToolTip>
      <EuiFlexGroup alignItems="center" justifyContent="center" >
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
