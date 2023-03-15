import React from 'react'
import { EuiButtonIcon, EuiText, EuiTextColor, EuiToolTip } from '@elastic/eui'

import styles from '../../styles.module.scss'

export interface Props {
  host: string
  port: string
}

const SentinelHostPort = (props: Props) => {
  const { host, port } = props

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  return (
    <EuiText color="subdued" className={styles.sentinelCollapsedField}>
      Host:Port:
      <div className={styles.hostPort}>
        <EuiTextColor>{`${host}:${port}`}</EuiTextColor>
        <EuiToolTip
          position="right"
          content="Copy"
          anchorClassName="copyHostPortTooltip"
        >
          <EuiButtonIcon
            iconType="copy"
            aria-label="Copy host:port"
            className={styles.copyHostPortBtn}
            onClick={() => handleCopy(`${host}:${port}`)}
          />
        </EuiToolTip>
      </div>
    </EuiText>
  )
}

export default SentinelHostPort
