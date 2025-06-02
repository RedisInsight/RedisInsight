import React from 'react'
import { Typography } from '@redis-ui/components'
import styled from 'styled-components'
import cn from 'classnames'
import { Row } from 'uiSrc/components/base/layout/flex'
import { CommonProps } from 'uiSrc/components/base/theme/types'

type BodyProps = React.ComponentProps<typeof Typography.Body>
type ColorType = BodyProps['color'] | (string & {})
export type HealthProps = Omit<BodyProps, 'color'> & {
  color?: ColorType
}
const Indicator = styled.div<
  {
    $color: ColorType
  } & CommonProps
>`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || 'inherit'};
`

export const HealthText = ({
  color,
  size = 'S',
  className,
  ...rest
}: HealthProps) => (
  <Row align="center" gap="m" justify="start">
    <Indicator
      $color={color}
      className={cn(`color__${color}`, 'RI-health-indicator')}
    />
    <Typography.Body
      {...rest}
      component="div"
      size={size}
      className={cn(className, 'RI-health-text')}
    />
  </Row>
)
