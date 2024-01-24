import React from 'react'
import { EuiOutsideClickDetector, EuiPopover } from '@elastic/eui'
import { Props as PopoverProps } from '@elastic/eui/src/components/popover/popover'

const Popover = (props: PopoverProps) => {
  const { closePopover, ...rest } = props

  return (
    <EuiOutsideClickDetector
      onOutsideClick={closePopover}
    >
      <EuiPopover {...rest} closePopover={closePopover} />
    </EuiOutsideClickDetector>
  )
}

export default Popover
