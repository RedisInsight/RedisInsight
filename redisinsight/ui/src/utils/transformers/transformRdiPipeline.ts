import yaml from 'js-yaml'
import { IPipeline, IPipelineJSON, ISources, TestConnectionStatus, TransformResult } from 'uiSrc/slices/interfaces'

export const pipelineToYaml = (pipeline: IPipelineJSON) => ({
  config: yaml.dump(pipeline.config),
  jobs: Object.entries(pipeline.jobs)?.map(([key, value]) => ({
    name: key,
    value: yaml.dump(value)
  }))
})

export const pipelineToJson = ({ config, jobs }: IPipeline): IPipelineJSON => <IPipelineJSON>({
  config: yaml.load(config) || {},
  jobs: jobs.reduce<{ [key: string]: unknown }>((acc, job) => {
    acc[job.name] = yaml.load(job.value)
    return acc
  }, {})
})

export const transformConnectionResults = (sources: ISources): TransformResult => {
  const result: TransformResult = { success: [], fail: [] }
  console.log(sources)
  if (!sources) {
    return result
  }

  try {
    Object.entries(sources).forEach(([source, details]) => {
      if (details.status === TestConnectionStatus.Success) {
        result.success.push({ target: source })
      } else if (details.status === TestConnectionStatus.Fail) {
        const errorMessage = details.error?.message || 'Error'
        result.fail.push({ target: source, error: errorMessage })
      }
    })
  } catch (error) {
    // ignore
  }

  return result
}
