import yaml from 'js-yaml'
import { IPipelineJSON } from 'uiSrc/slices/interfaces'

export const pipelineToYaml = (pipeline: IPipelineJSON) => ({
  config: yaml.dump(pipeline.config),
  jobs: Object.entries(pipeline.jobs)?.map(([key, value]) => ({
    name: key,
    value: yaml.dump(value)
  }))
})
