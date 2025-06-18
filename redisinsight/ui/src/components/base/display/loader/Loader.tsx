import React, { ComponentProps } from 'react'

import { Loader as RedisLoader } from '@redis-ui/components'
import { useTheme } from '@redis-ui/styles'

type Space = {
  space000: string;
  space010: string;
  space025: string;
  space050: string;
  space100: string;
  space150: string;
  space200: string;
  space250: string;
  space300: string;
  space400: string;
  space500: string;
  space550: string;
  space600: string;
  space800: string;
}

export type RedisLoaderProps = ComponentProps<typeof RedisLoader>

const convertSizeToPx = (tShirtSize: string, space: Space) => {
  switch (tShirtSize.toLowerCase()) {
    case 's':
      return space.space050
    case 'm':
      return space.space100
    case 'l':
      return space.space250
    case 'xl':
      return space.space300
    default:
      return space.space100
  }
}

export default function Loader({ size, ...rest }: RedisLoaderProps) {
  const theme = useTheme()
  const { space } = theme.core
  const sizeInPx = size ? convertSizeToPx(size, space) : space.space100
  return <RedisLoader size={sizeInPx} {...rest} />
}
