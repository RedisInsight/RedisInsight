import React, { useCallback } from 'react'
import { EuiText, EuiToolTip, } from '@elastic/eui'
import { getConfig } from 'uiSrc/config'
import styles from 'uiSrc/components/instance-header/styles.module.scss'

const riConfig = getConfig()

export const SmConsoleLink = () => {
  const onClick = useCallback(() => {
    window.open(riConfig.app.smConsoleRedirect, '_blank')
  }, [riConfig])

  return (
    <EuiToolTip
      position="bottom"
      content=""
    >
      <EuiText
        className={styles.breadCrumbLink}
        aria-label="Admin console"
        data-testid="admin-console-breadcrumb-btn"
        onClick={onClick}
      >
        &#60; Admin Console
      </EuiText>
    </EuiToolTip>
  )
}
