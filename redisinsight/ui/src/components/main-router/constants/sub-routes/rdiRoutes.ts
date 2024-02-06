import { IRoute, Pages } from 'uiSrc/constants'
import ModePage from 'uiSrc/pages/rdi/pipeline/pages/mode'
import ConfigPage from 'uiSrc/pages/rdi/pipeline/pages/config'
import JobsPage from 'uiSrc/pages/rdi/pipeline/pages/jobs'

export const RDI_ROUTES: IRoute[] = [
  {
    path: Pages.rdiPipelineSelectMode(':rdiInstanceId'),
    component: ModePage,
  },
  {
    path: Pages.rdiPipelineConfig(':rdiInstanceId'),
    component: ConfigPage,
  },
  {
    path: Pages.rdiPipelineJobs(':rdiInstanceId', ':jobName'),
    component: JobsPage,
  },
]
