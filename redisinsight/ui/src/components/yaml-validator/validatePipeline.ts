import { get } from 'lodash'
import { validateYamlSchema } from './validateYamlSchema'

interface PipelineValidationProps {
  config: string
  schema: any
  jobs: { value: string }[]
}

export const validatePipeline = ({
  config,
  schema,
  jobs,
}: PipelineValidationProps) => {
  const { valid: isConfigValid, errors: configErrors } = validateYamlSchema(
    config,
    get(schema, 'config', null),
  )

  const { areJobsValid, jobErrors } = jobs.reduce<{
    areJobsValid: boolean
    jobErrors: string[]
  }>(
    (acc, j) => {
      const validation = validateYamlSchema(j.value, get(schema, 'jobs', null))

      if (!validation.valid) {
        acc.jobErrors.push(...validation.errors)
      }

      acc.areJobsValid = acc.areJobsValid && validation.valid
      return acc
    },
    { areJobsValid: true, jobErrors: [] },
  )

  const result = isConfigValid && areJobsValid

  return {
    result,
    configValidationErrors: [...new Set([...configErrors])],
    jobsValidationErrors: [...new Set([...jobErrors])],
  }
}
