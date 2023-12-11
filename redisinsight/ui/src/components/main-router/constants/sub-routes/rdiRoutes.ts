import { IRoute, Pages } from 'uiSrc/constants'
import PreparePage from 'uiSrc/pages/rdi/pipeline/pages/prepare'
import ConfigPage from 'uiSrc/pages/rdi/pipeline/pages/config'
import RdiPipeline from 'uiSrc/pages/rdi/pipeline/PipelinePage'

export const RDI_ROUTES: IRoute[] = [
  {
    path: Pages.rdiPipeline(':rdiInstanceId'),
    component: RdiPipeline,
  },
  {
    path: Pages.rdiPipelinePrepare(':rdiInstanceId'),
    component: PreparePage,
  },
  {
    path: Pages.rdiPipelineConfig(':rdiInstanceId'),
    component: ConfigPage,
  },
]
