import React from 'react'
import { Typography } from '@redis-ui/components'

export type TitleProps = React.ComponentProps<typeof Typography.Heading> & {}
export const Title = ({ ...rest }: TitleProps) => (
  <Typography.Heading {...rest} />
)
