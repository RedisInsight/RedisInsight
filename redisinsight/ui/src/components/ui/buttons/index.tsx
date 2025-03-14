import React from 'react'
import { Button } from '@redislabsdev/redis-ui-components'

type Props = Omit<React.ComponentProps<typeof Button>, 'variant'>

const PrimaryButton = ({ children, ...props }: Props) => (
  <Button {...props} variant="primary">
    {children}
  </Button>
)

const SecondaryButton = ({ children, ...props }: Props) => (
  <Button {...props} variant="secondary-fill">
    {children}
  </Button>
)

export { PrimaryButton, SecondaryButton }
