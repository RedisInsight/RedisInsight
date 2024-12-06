import { AddDbType } from 'uiSrc/pages/home/constants'

export interface Values {
  connectionURL?: string
}

export const CONNECTIVITY_OPTIONS = [
  {
    id: 'sentinel',
    title: 'Redis Sentinel',
    type: AddDbType.sentinel
  },
  {
    id: 'software',
    title: 'Redis Software',
    type: AddDbType.software
  },
  {
    id: 'import',
    title: 'Import from file',
    type: AddDbType.import
  }
]
