import React, { useState } from 'react'
import {
  EuiButton,
  EuiCheckbox,
  EuiFormRow,
  EuiIcon,
  EuiPopover,
  EuiText,
} from '@elastic/eui'
import { formatLongName } from 'uiSrc/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import styles from '../styles.module.scss'

export interface Props<T> {
  selection: T[]
  onExport: (instances: T[], withSecrets: boolean) => void
  subTitle: string
}

const ExportAction = <T extends { id: string; name?: string }>(
  props: Props<T>,
) => {
  const { selection, onExport, subTitle } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [withSecrets, setWithSecrets] = useState(true)

  const exportBtn = (
    <EuiButton
      onClick={() => setIsPopoverOpen((prevState) => !prevState)}
      fill
      color="secondary"
      size="s"
      iconType="exportAction"
      className={styles.actionBtn}
      data-testid="export-btn"
    >
      Export
    </EuiButton>
  )

  return (
    <EuiPopover
      id="exportPopover"
      ownFocus
      button={exportBtn}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize="l"
      data-testid="export-popover"
    >
      <EuiText size="m">
        <p className={styles.popoverSubTitle}>{subTitle}</p>
      </EuiText>
      <div className={styles.boxSection}>
        {selection.map((select) => (
          <Row key={select.id} gap="s" className={styles.nameList}>
            <FlexItem>
              <EuiIcon type="check" />
            </FlexItem>
            <FlexItem grow className={styles.nameListText}>
              <span>{formatLongName(select.name)}</span>
            </FlexItem>
          </Row>
        ))}
      </div>
      <EuiFormRow style={{ marginTop: 16 }}>
        <EuiCheckbox
          id="export-passwords"
          name="export-passwords"
          label="Export passwords"
          checked={withSecrets}
          onChange={(e) => setWithSecrets(e.target.checked)}
          data-testid="export-passwords"
        />
      </EuiFormRow>
      <div className={styles.popoverFooter}>
        <EuiButton
          fill
          size="s"
          color="secondary"
          iconType="exportAction"
          onClick={() => {
            setIsPopoverOpen(false)
            onExport(selection, withSecrets)
          }}
          data-testid="export-selected-dbs"
        >
          Export
        </EuiButton>
      </div>
    </EuiPopover>
  )
}

export default ExportAction
