import React from 'react'
import { EuiToolTip } from '@elastic/eui'

import { ColorText, Text } from 'uiSrc/components/base/text'
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
    <Text color="subdued" className={styles.sentinelCollapsedField}>
      Sentinel Host & Port:
      <div className={styles.hostPort}>
        <ColorText>{`${host}:${port}`}</ColorText>
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
    </Text>
  )
}

export default SentinelHostPort
