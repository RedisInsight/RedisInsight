import React from 'react'
import cx from 'classnames'
import { EuiToolTip } from '@elastic/eui'

import { useDispatch, useSelector } from 'react-redux'
import {
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'

import { CopilotIcon } from 'uiSrc/components/base/icons'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
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
        [styles.isOpen]: openedPanel === SidePanels.AiAssistant,
      })}
    >
      <EuiToolTip content="Redis Copilot">
        <EmptyButton
          className={styles.btn}
          role="button"
          icon={CopilotIcon}
          onClick={handleClickTrigger}
          data-testid="copilot-trigger"
        />
      </EuiToolTip>
    </div>
  )
}

export default CopilotTrigger
