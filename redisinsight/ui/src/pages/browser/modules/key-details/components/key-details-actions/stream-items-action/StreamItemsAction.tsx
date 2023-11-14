import React from 'react'
import { EuiButton, EuiButtonIcon, EuiToolTip } from '@elastic/eui'
import cx from 'classnames'

import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import styles from '../styles.module.scss'

export interface Props {
  width: number
  title: string
  openAddItemPanel: () => void
}

const StreamItemsAction = ({ width, title, openAddItemPanel }: Props) => (
  <EuiToolTip
    content={width > MIDDLE_SCREEN_RESOLUTION ? '' : title}
    position="left"
    anchorClassName={cx(styles.actionBtn, { [styles.withText]: width > MIDDLE_SCREEN_RESOLUTION })}
  >
    <>
      {width > MIDDLE_SCREEN_RESOLUTION ? (
        <EuiButton
          size="s"
          iconType="plusInCircle"
          color="secondary"
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        >
          {title}
        </EuiButton>
      ) : (
        <EuiButtonIcon
          iconType="plusInCircle"
          color="primary"
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        />
      )}
    </>
  </EuiToolTip>
)

export { StreamItemsAction }
