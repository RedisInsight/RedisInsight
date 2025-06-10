import React from 'react'

import { Switch } from '@redis-ui/components'

type SwitchInputProps = React.ComponentProps<typeof Switch>

const SwitchInput = ({ style, ...props }: SwitchInputProps) => (
  <Switch
    {...props}
    style={{
      alignItems: 'center',
      ...style,
    }}
  />
)

export default SwitchInput
