import { Theme } from 'uiSrc/constants'

export interface StateContentCreateRedis {
  data: Record<string, ContentCreateRedis>
  loading: boolean
  error: string
}

export interface ContentCreateRedis {
  title: string
  description?: string
  links: Record<string, {
    altText: string
    url: string
    event?: string
  }>
  styles?: {
    [Theme.Dark]: Record<string, any>
    [Theme.Light]: Record<string, any>
  }
}
