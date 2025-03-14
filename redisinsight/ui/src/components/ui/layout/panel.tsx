import React from 'react'
import { Card } from '@redislabsdev/redis-ui-components'

type Props = React.ComponentProps<typeof Card>
const Panel = ({ children, ...props }: Props) => (
  <Card
    {...props}
    className="panel"
    style={{
      padding: '10px',
    }}
  >
    {children}
  </Card>
)
export default Panel
