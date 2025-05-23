import { EuiToolTip } from '@elastic/eui'
import React from 'react'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon, MinusIcon } from 'uiSrc/components/base/icons'

type Props = {
  onClose: () => void
  onHide: () => void
  id?: string
  label?: string
  closeContent?: string
  hideContent?: string
}
export const WindowControlGroup = ({
  onClose,
  onHide,
  id,
  label,
  closeContent = 'Close',
  hideContent = 'Minimize',
}: Props) => (
  <Row gap="m" justify="end">
    <FlexItem>
      <EuiToolTip
        content={hideContent}
        position="top"
        display="inlineBlock"
        anchorClassName="flex-row"
      >
        <IconButton
          size="S"
          icon={MinusIcon}
          id={`hide-${id}`}
          aria-label={`hide ${label || id || ''}`}
          data-testid={`hide-${id}`}
          onClick={onHide}
        />
      </EuiToolTip>
    </FlexItem>
    <FlexItem>
      <EuiToolTip
        content={closeContent}
        position="top"
        display="inlineBlock"
        anchorClassName="flex-row"
      >
        <IconButton
          size="S"
          icon={CancelSlimIcon}
          id={`close-${id}`}
          aria-label={`close ${label || id || ''}`}
          data-testid={`close-${id}`}
          onClick={onClose}
        />
      </EuiToolTip>
    </FlexItem>
  </Row>
)
