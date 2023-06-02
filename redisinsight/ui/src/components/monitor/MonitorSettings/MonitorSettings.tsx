import React, { useState } from 'react'
import { EuiFieldNumber, EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui'
import cx from 'classnames'

import InlineItemEditor from 'uiSrc/components/inline-item-editor'

import styles from './styles.module.scss'

const MonitorSettings = () => {
  const [value, setValue] = useState<string>('10 000')
  const [isEditing, setEditing] = useState<boolean>(false)
  const [isHovering, setHovering] = useState<boolean>(false)

  return (
    <EuiFlexGroup alignItems="center" gutterSize="none" responsive={false} className={styles.container}>
      <EuiFlexItem grow={false} style={{ marginRight: '4px' }}>
        <EuiText size="xs" color="subdued" className={styles.inputLabel}>Number of Rows</EuiText>
      </EuiFlexItem>

      <EuiFlexItem
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => setEditing(true)}
        grow={false}
        component="span"
        style={{ paddingBottom: '1px' }}
      >
        {isEditing || isHovering ? (
          <InlineItemEditor
            controlsPosition="right"
            viewChildrenMode={!isEditing}
            onApply={() => {}}
            onDecline={() => {}}
            declineOnUnmount={false}
          >
            <EuiFieldNumber
              onChange={() => {}}
              value={value}
              placeholder="Enter Count"
              className={
                cx(styles.input, { [styles.inputEditing]: isEditing })
              }
              fullWidth={false}
              compressed
              autoComplete="off"
              type="text"
              readOnly={!isEditing}
            />
          </InlineItemEditor>
        ) : (
          <EuiText className={styles.value}>
            {value}
          </EuiText>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

export default MonitorSettings
