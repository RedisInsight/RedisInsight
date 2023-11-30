import { IRoute } from 'uiSrc/constants'
import RdiList from 'uiSrc/pages/rdi/home'

export const RDI_ROUTES: IRoute[] = [
  {
    // todo: rename path
    path: '/:rdiId',
    // todo add component like Instance page
    component: RdiList,
    routes: [
      // todo: add page routes here
    ],
  },
]
