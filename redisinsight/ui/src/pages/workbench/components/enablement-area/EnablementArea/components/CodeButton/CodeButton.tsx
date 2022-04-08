import React from 'react'
import { EuiButton } from '@elastic/eui'
import { truncateText } from 'uiSrc/utils'

import styles from './styles.module.scss'

export interface Props {
  onClick: () => void
  label: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
}
const CodeButton = ({ onClick, label, isLoading, className, disabled, ...rest }: Props) => (
  <EuiButton
    iconSide="right"
    isLoading={isLoading}
    size="s"
    onClick={onClick}
    fullWidth
    color="secondary"
    className={[className, styles.button].join(' ')}
    textProps={{ className: styles.buttonText }}
    data-testid={`preselect-${label}`}
    disabled={disabled}
    {...rest}
  >
    {truncateText(label, 86)}
  </EuiButton>
)

export default CodeButton
