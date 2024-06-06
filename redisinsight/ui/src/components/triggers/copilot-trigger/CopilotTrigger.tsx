import React from 'react'
import cx from 'classnames'
import { EuiButton, EuiToolTip } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import { sidePanelsSelector, toggleSidePanel } from 'uiSrc/slices/panels/sidePanels'

import CopilotIcon from 'uiSrc/assets/img/icons/copilot.svg?react'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import styles from './styles.module.scss'

const CopilotTrigger = () => {
  const { openedPanel } = useSelector(sidePanelsSelector)

  const dispatch = useDispatch()

  const handleClickTrigger = () => {
    dispatch(toggleSidePanel(SidePanels.AiAssistant))
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.isOpen]: openedPanel === SidePanels.AiAssistant
      })}
    >
      <EuiToolTip
        content="Redis Copilot"
      >
        <EuiButton
          fill
          size="s"
          color="secondary"
          className={styles.btn}
          role="button"
          iconType={CopilotIcon}
          onClick={handleClickTrigger}
          data-testid="copilot-trigger"
        />
      </EuiToolTip>
    </div>
  )
}

export default CopilotTrigger
