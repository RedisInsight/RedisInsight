import yaml from 'js-yaml'
import { IPipeline, IPipelineJSON } from 'uiSrc/slices/interfaces'

export const pipelineToYaml = (pipeline: IPipelineJSON) => ({
  config: yaml.dump(pipeline.config),
  jobs: Object.entries(pipeline.jobs)?.map(([key, value]) => ({
    name: key,
    value: yaml.dump(value)
  }))
})

export const pipelineToJson = ({ config, jobs }: IPipeline): IPipelineJSON => ({
  config: yaml.load(config) || {},
  jobs: jobs.reduce((acc, job) => {
    acc[job.name] = yaml.load(job.value)
    return acc
  }, {})
})
