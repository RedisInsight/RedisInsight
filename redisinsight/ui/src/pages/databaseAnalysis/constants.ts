import { ReactNode } from 'react'

export enum TableView {
  MEMORY = 'memory',
  KEYS = 'keys',
}

export enum EmptyMessage {
  Reports = 'reports',
  Keys = 'keys'
}

export type Content = {
  title: string
  text: (path: string) => ReactNode
}
