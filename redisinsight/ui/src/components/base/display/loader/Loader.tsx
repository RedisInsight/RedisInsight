import React, { ComponentProps } from 'react'

import { Loader as RedisLoader } from '@redis-ui/components'

export type RedisLoaderProps = ComponentProps<typeof RedisLoader>

const convertSizeToPx = (tShirtSize: string) => {
  switch (tShirtSize) {
    case 's':
    case 'S':
      return '8px'
    case 'm':
    case 'M':
      return '16px'
    case 'l':
    case 'L':
      return '24px'
    case 'xl':
    case 'XL':
      return '32px'
    default:
      return '16px'
  }
}

export default function Loader({ size, ...rest }: RedisLoaderProps) {
  const sizeInPx = size ? convertSizeToPx(size) : '16px'
  return <RedisLoader size={sizeInPx} {...rest} />
}
