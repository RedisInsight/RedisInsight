import React from 'react'
import { EuiFormRow, EuiIcon, EuiTextArea, EuiToolTip } from '@elastic/eui'

import styles from './styles.module.scss'

export interface Props {
  value: string
  onChange: (e: React.ChangeEvent<any>) => void
}

const ConnectionUrl = ({ value, onChange }: Props) => (
  <EuiFormRow label={(
    <div className={styles.connectionUrlInfo}>
      <div>Connection URL</div>
      <EuiToolTip
        title="The following connection URLs are supported:"
        className="homePage_tooltip"
        position="right"
        content={(
          <ul className="homePage_toolTipUl">
            <li><span className="dot" />redis://[[username]:[password]]@host:port</li>
            <li><span className="dot" />rediss://[[username]:[password]]@host:port</li>
            <li><span className="dot" />host:port</li>
          </ul>
          )}
      >
        <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
      </EuiToolTip>
    </div>
    )}
  >
    <EuiTextArea
      name="connectionURL"
      id="connectionURL"
      value={value}
      onChange={onChange}
      fullWidth
      placeholder="redis://default@127.0.0.1:6379"
      resize="none"
      style={{ height: 88 }}
      data-testid="connection-url"
    />
  </EuiFormRow>
)

export default ConnectionUrl
