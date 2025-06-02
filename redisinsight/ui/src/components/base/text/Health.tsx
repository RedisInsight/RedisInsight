import React from 'react'
import { Typography } from '@redis-ui/components'
import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

type BodyProps = React.ComponentProps<typeof Typography.Body>
type ColorType = BodyProps['color'] | (string & {})
export type HealthProps = Omit<BodyProps, 'color'> & {
  color?: ColorType
}
const Indicator = styled.div<{
  $color: ColorType
}>`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || 'inherit'};
`

export const Health = ({ color, size = 'S', ...rest }: HealthProps) => (
  <Row align="center" gap="m" justify="start">
    <Indicator $color={color} />
    <Typography.Body {...rest} component="div" size={size} />
  </Row>
)
