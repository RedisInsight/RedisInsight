import { Pages, PageValues } from 'uiSrc/constants'

interface HomeTab {
  id: string
  title: string
  path: PageValues
}

const tabs: HomeTab[] = [
  {
    id: 'databases',
    title: 'My Redis databases',
    path: Pages.home
  },
  {
    id: 'rdi-instances',
    title: 'Redis Data Integration',
    path: Pages.rdi
  }
]

export {
  tabs
}
