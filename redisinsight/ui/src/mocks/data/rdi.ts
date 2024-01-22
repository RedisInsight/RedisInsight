export const MOCK_RDI_PIPELINE_CONFIG = 'connections:\n'
  + '# Redis data DB connection \n'
  + '# This section is for configuring the Redis database to which Redis Data Integration will connect to\n'
  + '  target:\n'
  + '    # Target type - Redis is the only supported type\n'
  + '    type: redis\n'

export const MOCK_RDI_PIPELINE_JOB2 = {
  name: 'job2',
  value: 'job2:\n'
    + '# Job information \n'
    + '# This section is for transformation\n'
    + '  transform:\n'
    + '    # Target type - Redis is the only supported type\n'
    + '    type: redis\n'
}

export const MOCK_RDI_PIPELINE_JOB1 = {
  name: 'jobName',
  value: 'job:\n'
    + '# Job information \n'
    + '# This section is for transformation\n'
    + '  transform:\n'
    + '    # Target type - Redis is the only supported type\n'
    + '    type: redis\n'
}

export const MOCK_RDI_PIPELINE_DATA = {
  config: MOCK_RDI_PIPELINE_CONFIG,
  jobs: [MOCK_RDI_PIPELINE_JOB1, MOCK_RDI_PIPELINE_JOB2],
}
