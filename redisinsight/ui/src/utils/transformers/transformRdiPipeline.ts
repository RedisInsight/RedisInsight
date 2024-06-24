import yaml, { YAMLException } from 'js-yaml'
import {
  IPipeline,
  IPipelineJSON,
  ITargets,
  IYamlFormatError,
  TestConnectionStatus,
  TransformResult
} from 'uiSrc/slices/interfaces'

export const yamlToJson = (value: string, onError: (e: string) => void) => {
  try {
    return yaml.load(value) || {}
  } catch (e) {
    if (e instanceof YAMLException) {
      onError(e.reason)
    }
    return undefined
  }
}

export const pipelineToYaml = (pipeline: IPipelineJSON) => ({
  config: yaml.dump(pipeline.config),
  jobs: Object.entries(pipeline.jobs)?.map(([key, value]) => ({
    name: key,
    value: yaml.dump(value)
  }))
})

export const pipelineToJson = ({ config, jobs }: IPipeline, onError: (errors: IYamlFormatError[]) => void) => {
  const result: IPipelineJSON = {
    config: {},
    jobs: []
  }
  const errors: IYamlFormatError[] = []

  result.config = yamlToJson(config, (msg) => errors.push({ filename: 'config', msg })) || {}

  result.jobs = jobs.reduce<{ [key: string]: unknown }>((acc, job) => {
    acc[job.name] = yamlToJson(job.value, (msg) => errors.push({ filename: job.name, msg })) || {}
    return acc
  }, {})

  if (errors.length) {
    onError(errors)
    return undefined
  }

  return result
}

export const transformConnectionResults = (sources: ITargets): TransformResult => {
  const result: TransformResult = { success: [], fail: [] }
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
