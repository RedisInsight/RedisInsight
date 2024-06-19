import { FeatureFlags, Pages, PageValues } from 'uiSrc/constants'

interface HomeTab {
  id: string
  title: string
  path: PageValues
  featureFlag?: FeatureFlags
}

const tabs: HomeTab[] = [
  {
    id: 'databases',
    title: 'Redis Databases',
    path: Pages.home
  },
  {
    id: 'rdi-instances',
    title: 'Redis Data Integration',
    path: Pages.rdi,
    featureFlag: FeatureFlags.rdi
  }
]

export {
  tabs
}
