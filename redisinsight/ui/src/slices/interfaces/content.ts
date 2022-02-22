import { Theme } from 'uiSrc/constants'

export interface StateContentCreateDatabase {
  data: Record<string, ContentCreateDBItem>
  loading: boolean
  error: string
}

export interface ContentCreateDBItem {
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
