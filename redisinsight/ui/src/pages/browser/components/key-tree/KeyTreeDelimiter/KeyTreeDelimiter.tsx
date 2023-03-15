import React, { useState } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { EuiIcon, EuiPopover } from '@elastic/eui'

import { replaceSpaces } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { DEFAULT_DELIMITER } from 'uiSrc/constants'
import { appContextDbConfig, resetBrowserTree, setBrowserTreeDelimiter } from 'uiSrc/slices/app/context'

import styles from './styles.module.scss'

export interface Props {
  loading: boolean
}
const MAX_DELIMITER_LENGTH = 5
const KeyTreeDelimiter = ({ loading }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { treeViewDelimiter: delimiter = '' } = useSelector(appContextDbConfig)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useDispatch()

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  const closePopover = () => setIsPopoverOpen(false)

  const button = (
    <div
      onClick={onButtonClick}
      className={cx(styles.anchorBtn, { [styles.anchorBtnOpen]: isPopoverOpen })}
      role="button"
      tabIndex={0}
      onKeyDown={() => {}}
      data-testid="tree-view-delimiter-btn"
    >
      <span>{replaceSpaces(delimiter)}</span>
      <EuiIcon type="arrowDown" />
    </div>
  )

  const handleApplyDelimiter = (value: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: {
        databaseId: instanceId,
        from: delimiter,
        to: value || DEFAULT_DELIMITER
      }
    })
    closePopover()
    dispatch(setBrowserTreeDelimiter(value || DEFAULT_DELIMITER))

    dispatch(resetBrowserTree())
  }

  return (
    <div className={styles.container}>
      <EuiPopover
        ownFocus={false}
        anchorPosition="downLeft"
        isOpen={isPopoverOpen}
        anchorClassName={styles.anchorWrapper}
        panelClassName={styles.popoverWrapper}
        closePopover={closePopover}
        button={button}
      >
        <div className={styles.inputLabel}>Delimiter</div>
        <div className={styles.input} data-testid="tree-view-delimiter-input">
          <InlineItemEditor
            initialValue={delimiter}
            controlsDesign="separate"
            placeholder=":"
            fieldName="delimiter"
            maxLength={MAX_DELIMITER_LENGTH}
            isLoading={loading}
            onDecline={() => closePopover()}
            onApply={(value) => handleApplyDelimiter(value)}
          />
        </div>
      </EuiPopover>
    </div>
  )
}

export default React.memo(KeyTreeDelimiter)
