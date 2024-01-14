import {
  EuiButtonIcon,
  EuiToolTip,
} from '@elastic/eui'
import React from 'react'

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
    <EuiButtonIcon
      iconType={isFullScreen ? 'fullScreenExit' : 'fullScreen'}
      color="primary"
      aria-label="Open full screen"
      onClick={onToggleFullScreen}
      data-testid={btnTestId}
    />
  </EuiToolTip>
)

export { FullScreen }
