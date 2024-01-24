import React, { ReactElement } from 'react'
import { EuiOutsideClickDetector, EuiPopover } from '@elastic/eui'
import { Props as PopoverProps } from '@elastic/eui/src/components/popover/popover'

export interface Props extends PopoverProps {
  children: ReactElement
}

const Popover = (props: Props) => {
  const { closePopover, children, ...rest } = props

  return (
    <EuiPopover {...rest} closePopover={closePopover}>
      <EuiOutsideClickDetector
        onOutsideClick={closePopover}
      >
        {children}
      </EuiOutsideClickDetector>
    </EuiPopover>
  )
}

export default Popover
