import { EuiButton, EuiIcon } from '@elastic/eui'
import React from 'react'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { truncateText } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  onClick: (execute?: ExecuteButtonMode, params?: CodeButtonParams) => void
  label: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
  params?: CodeButtonParams
  execute?: ExecuteButtonMode
}
const CodeButton = ({ onClick, label, isLoading, className, disabled, params, execute, ...rest }: Props) => {
  const isAutoExecute = execute === ExecuteButtonMode.Auto

  return (
    <EuiButton
      iconSide="right"
      isLoading={isLoading}
      size="s"
      onClick={() => onClick(execute, params)}
      fullWidth
      color="secondary"
      className={[className, styles.button].join(' ')}
      textProps={{ className: styles.buttonText }}
      data-testid={`preselect-${isAutoExecute ? 'auto-' : ''}${label}`}
      disabled={disabled}
      {...rest}
    >
      <>
        {truncateText(label, 86)}
        {isAutoExecute && (
          <EuiIcon
            className={styles.autoExecuteIcon}
            type="playFilled"
          />
        )}
      </>
    </EuiButton>
  )
}

export default CodeButton
