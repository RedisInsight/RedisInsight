export const MOCK_RDI_PIPELINE_CONFIG = `connections:
  # Redis data DB connection
  # This section is for configuring the Redis database to which Redis Data Integration will connect to
    target:
      # Target type - Redis is the only supported type
      type: redis`

export const MOCK_RDI_PIPELINE_JOB2 = {
  name: 'job2',
  value: `job2:
    # Job information
    # This section is for transformation
      transform:
        # Target type - Redis is the only supported type
        type: redis`
}

export const MOCK_RDI_PIPELINE_JOB1 = {
  name: 'jobName',
  value: `job:
    # Job information
    # This section is for transformation
      transform:
        # Target type - Redis is the only supported type
        type: redis`
}

export const MOCK_RDI_PIPELINE_DATA = {
  config: MOCK_RDI_PIPELINE_CONFIG,
  jobs: [MOCK_RDI_PIPELINE_JOB1, MOCK_RDI_PIPELINE_JOB2],
}
