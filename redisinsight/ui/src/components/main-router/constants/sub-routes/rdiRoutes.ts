import { IRoute, Pages } from 'uiSrc/constants'
import PreparePage from 'uiSrc/pages/rdi/pipeline/pages/prepare'
import ConfigPage from 'uiSrc/pages/rdi/pipeline/pages/config'
import JobsPage from 'uiSrc/pages/rdi/pipeline/pages/jobs'
import EmptyPage from 'uiSrc/pages/rdi/pipeline/pages/empty'

export const RDI_ROUTES: IRoute[] = [
  {
    path: Pages.rdiPipelinePrepare(':rdiInstanceId'),
    component: PreparePage
  },
  {
    path: Pages.rdiPipelineConfig(':rdiInstanceId'),
    component: ConfigPage
  },
  {
    path: Pages.rdiPipelineJobs(':rdiInstanceId', ':jobName'),
    component: JobsPage
  },
  {
    path: Pages.rdiPipeline(':rdiInstanceId'),
    component: EmptyPage
  }
]
