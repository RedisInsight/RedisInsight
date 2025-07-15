import React from 'react'

import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextArea } from 'uiSrc/components/base/inputs'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  value: string
  onChange: (e: React.ChangeEvent<any>) => void
}

const ConnectionUrl = ({ value, onChange }: Props) => (
  <FormField
    label={
      <div className={styles.connectionUrlInfo}>
        <div>Connection URL</div>
        <RiTooltip
          title="The following connection URLs are supported:"
          className="homePage_tooltip"
          position="right"
          content={
            <ul className="homePage_toolTipUl">
              <li>
                <span className="dot" />
                redis://[[username]:[password]]@host:port
              </li>
              <li>
                <span className="dot" />
                rediss://[[username]:[password]]@host:port
              </li>
              <li>
                <span className="dot" />
                host:port
              </li>
            </ul>
          }
        >
          <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
        </RiTooltip>
      </div>
    }
  >
    <TextArea
      name="connectionURL"
      id="connectionURL"
      value={value}
      onChangeCapture={onChange}
      placeholder="redis://default@127.0.0.1:6379"
      style={{ height: 88 }}
      data-testid="connection-url"
    />
  </FormField>
)

export default ConnectionUrl
