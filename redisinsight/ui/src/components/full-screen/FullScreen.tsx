import { EuiToolTip } from '@elastic/eui'
import React from 'react'
import { ExtendIcon, ShrinkIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  anchorClassName?: string
  btnTestId?: string
}

const FullScreen = ({
  isFullScreen,
  onToggleFullScreen,
  anchorClassName = '',
  btnTestId = 'toggle-full-screen',
}: Props) => (
  <EuiToolTip
    content={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
    position="left"
    anchorClassName={anchorClassName}
  >
    <IconButton
      icon={isFullScreen ? ShrinkIcon : ExtendIcon}
      color="primary"
      aria-label="Open full screen"
      onClick={onToggleFullScreen}
      data-testid={btnTestId}
    />
  </EuiToolTip>
)

export { FullScreen }
