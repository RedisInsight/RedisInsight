import React from 'react'

import { Switch } from '@redis-ui/components'

const SwitchInput: React.FC<React.ComponentProps<typeof Switch>> = ({
  style,
  ...props
}) => (
  <Switch
    {...props}
    style={{
      alignItems: 'center',
      ...style,
    }}
  />
)

export default SwitchInput
