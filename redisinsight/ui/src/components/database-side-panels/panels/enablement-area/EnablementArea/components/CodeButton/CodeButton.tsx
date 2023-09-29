import { EuiButton, EuiIcon } from '@elastic/eui'
import cx from 'classnames'
import React from 'react'
import { truncateText } from 'uiSrc/utils'
import { CodeButtonAutoExecute, CodeButtonParams, ExecuteButtonMode } from 'uiSrc/constants'

import styles from './styles.module.scss'

export interface Props {
  onClick: (execute: { mode?: ExecuteButtonMode, params?: CodeButtonParams }) => void
  label: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
  params?: CodeButtonParams
  mode?: ExecuteButtonMode
}
const CodeButton = ({ onClick, label, isLoading, className, disabled, params, mode, ...rest }: Props) => {
  const isAutoExecute = params?.auto === CodeButtonAutoExecute.true

  return (
    <EuiButton
      iconSide="right"
      isLoading={isLoading}
      size="s"
      onClick={() => onClick({ mode, params })}
      fullWidth
      color="secondary"
      className={cx(className, styles.button)}
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
