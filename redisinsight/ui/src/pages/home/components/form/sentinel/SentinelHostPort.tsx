import React from 'react'
import { EuiText, EuiTextColor, EuiToolTip } from '@elastic/eui'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
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
      Sentinel Host & Port:
      <div className={styles.hostPort}>
        <EuiTextColor>{`${host}:${port}`}</EuiTextColor>
        <EuiToolTip
          position="right"
          content="Copy"
          anchorClassName="copyHostPortTooltip"
        >
          <IconButton
            icon={CopyIcon}
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
