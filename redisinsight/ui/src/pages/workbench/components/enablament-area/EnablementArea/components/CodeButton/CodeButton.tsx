import React from 'react'
import { EuiButton } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  onClick: () => void;
  label: string;
  isLoading?: boolean;
}
const CodeButton = ({ onClick, label, isLoading }: Props) => (
  <EuiButton
    iconSide="right"
    isLoading={isLoading}
    size="s"
    onClick={onClick}
    fullWidth
    color="secondary"
    contentProps={{ className: styles.button }}
    textProps={{ className: styles.buttonText }}
    data-testid={`preselect-${label}`}
  >
    {label}
  </EuiButton>
)

export default CodeButton
