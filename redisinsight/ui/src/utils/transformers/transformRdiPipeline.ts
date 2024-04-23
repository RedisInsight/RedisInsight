import yaml from 'js-yaml'
import { IPipeline } from 'uiSrc/slices/interfaces'

export const pipelineToYaml = (pipeline: IPipeline) => ({
  config: yaml.dump(pipeline.config),
  jobs: Object.keys(pipeline.jobs)?.map((key: string) => ({
    name: key,
    value: yaml.dump(pipeline.jobs[key])
  }))
})
