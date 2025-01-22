import React from 'react'
import { EuiIcon } from '@elastic/eui'
import { AddDbType } from 'uiSrc/pages/home/constants'

import ShieldIcon from 'uiSrc/assets/img/shield.svg?react'
import RedisSoftwareIcon from 'uiSrc/assets/img/redis-software.svg?react'

export interface Values {
  connectionURL: string
}

export const CONNECTIVITY_OPTIONS = [
  {
    id: 'sentinel',
    title: 'Redis Sentinel',
    type: AddDbType.sentinel,
    icon: (props: Record<string, any> = {}) => <ShieldIcon {...props} />
  },
  {
    id: 'software',
    title: 'Redis Software',
    type: AddDbType.software,
    icon: (props: Record<string, any> = {}) => <RedisSoftwareIcon {...props} />
  },
  {
    id: 'import',
    title: 'Import from file',
    type: AddDbType.import,
    icon: (props: Record<string, any> = {}) => <EuiIcon type="importAction" {...props} />
  }
]
