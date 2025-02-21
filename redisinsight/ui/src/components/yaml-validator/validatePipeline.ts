import { get } from 'lodash'
import { validateYamlSchema } from './validateYamlSchema'

interface PipelineValidationProps {
  config: string
  schema: any
  jobs: { name: string; value: string }[]
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

  const { areJobsValid, jobsErrors } = jobs.reduce<{
    areJobsValid: boolean
    jobsErrors: Record<string, Set<string>>
  }>(
    (acc, j) => {
      const validation = validateYamlSchema(j.value, get(schema, 'jobs', null))

      if (!acc.jobsErrors[j.name]) {
        acc.jobsErrors[j.name] = new Set()
      }

      if (!validation.valid) {
        validation.errors.forEach((error) => acc.jobsErrors[j.name].add(error))
      }

      acc.areJobsValid = acc.areJobsValid && validation.valid
      return acc
    },
    { areJobsValid: true, jobsErrors: {} },
  )

  const result = isConfigValid && areJobsValid

  return {
    result,
    configValidationErrors: [...new Set(configErrors)],
    jobsValidationErrors: Object.fromEntries(
      Object.entries(jobsErrors).map(([jobName, errors]) => [jobName, [...errors]])
    ),
  }
}
