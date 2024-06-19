import { pipelineToYaml, pipelineToJson, transformConnectionResults } from 'uiSrc/utils'

const pipelineToJsonTests: any[] = [
  [
    {
      config: 'connections:\n  # Redis data DB connection details\n  # This section is for configuring the Redis database to which Redis Data Integration will connect to\n  target:\n    # Target type - Redis is the only supported type (default: redis)\n    type: redis\n    # Host of the Redis database to which Redis Data Integration will write the processed data\n    host: redis-18262.c232.us-east-1-2.ec2.cloud.redislabs.com\n    # Port for the Redis database to which Redis Data Integration will write the processed data\n    port: 18262\n    # User of the Redis database to which Redis Data Integration will write the processed data\n    user: default',
      jobs: [
        { name: 'job1', value: 'source:\n  row_format: full\n  server_name: chinook\n  schema: dbo\n  table: Employee\ntransform:\n  - uses: filter\n    with:\n      language: jmespath\n      expression: in(after.LastName,[\'Smith\']) && opcode == \'c\'\noutput:\n  - uses: redis.write\n    with:\n      data_type: json\n      mapping:\n        - EmployeeId\n        - FirstName\n        - LastName' }
      ]
    },
    {
      config: {
        connections: {
          target: {
            host: 'redis-18262.c232.us-east-1-2.ec2.cloud.redislabs.com',
            port: 18262,
            type: 'redis',
            user: 'default'
          }
        }
      },
      jobs: {
        job1: {
          output: [
            {
              uses: 'redis.write',
              with: {
                data_type: 'json',
                mapping: [
                  'EmployeeId',
                  'FirstName',
                  'LastName'
                ]
              }
            }
          ],
          source: {
            row_format: 'full',
            schema: 'dbo',
            server_name: 'chinook',
            table: 'Employee'
          },
          transform: [
            {
              uses: 'filter',
              with: {
                expression: "in(after.LastName,['Smith']) && opcode == 'c'",
                language: 'jmespath'
              }
            }
          ]
        }
      },
    }
  ]
]

describe('pipelineToJson', () => {
  it.each(pipelineToJsonTests)('for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = pipelineToJson(input)
      expect(result).toEqual(expected)
    })
})

const pipelineToYamlTests: any[] = [
  [
    {
      config: {
        connections: {
          target: {
            host: 'redis-18262.c232.us-east-1-2.ec2.cloud.redislabs.com',
            port: 18262,
            type: 'redis',
            user: 'default'
          }
        }
      },
      jobs: {
        job1: {
          output: [
            {
              uses: 'redis.write',
              with: {
                data_type: 'json',
                mapping: [
                  'EmployeeId',
                  'FirstName',
                  'LastName'
                ]
              }
            }
          ],
          source: {
            row_format: 'full',
            schema: 'dbo',
            server_name: 'chinook',
            table: 'Employee'
          },
          transform: [
            {
              uses: 'filter',
              with: {
                expression: "in(after.LastName,['Smith']) && opcode == 'c'",
                language: 'jmespath'
              }
            }
          ]
        }
      },
    },
    {
      config: 'connections:\n  target:\n    host: redis-18262.c232.us-east-1-2.ec2.cloud.redislabs.com\n    port: 18262\n    type: redis\n    user: default\n',
      jobs: [
        {
          name: 'job1',
          value: "output:\n  - uses: redis.write\n    with:\n      data_type: json\n      mapping:\n        - EmployeeId\n        - FirstName\n        - LastName\nsource:\n  row_format: full\n  schema: dbo\n  server_name: chinook\n  table: Employee\ntransform:\n  - uses: filter\n    with:\n      expression: in(after.LastName,['Smith']) && opcode == 'c'\n      language: jmespath\n"
        }
      ]
    },
  ]
]

describe('pipelineToYaml', () => {
  it.each(pipelineToYamlTests)('for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = pipelineToYaml(input)
      expect(result).toEqual(expected)
    })
})

const transformConnectionResultsTests: any[] = [
  [
    null,
    { success: [], fail: [] }
  ],
  [
    {
      target1: {
        status: 'success',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Failed to establish connection to the PostgreSQL database. Invalid credentials provided'
        }
      },
      target2: {
        status: 'fail',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Failed to establish connection to the PostgreSQL database. Invalid credentials provided'
        }
      },
      target3: {
        status: 'wrong status',
      },
      target4: {
        status: 'wrong status',
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Failed to establish connection to the PostgreSQL database. Invalid credentials provided'
        }
      },
      target5: {
        status: 'success',
      },
      target6: {
        unknownProperty: 'foo bar'
      },
      target7: {
        status: 'fail',
      },
    },
    {
      success: [{ target: 'target1' }, { target: 'target5' }],
      fail: [
        { target: 'target2', error: 'Failed to establish connection to the PostgreSQL database. Invalid credentials provided' },
        { target: 'target7', error: 'Error' }
      ],
    }
  ]
]

describe('transformConnectionResults', () => {
  it.each(transformConnectionResultsTests)('for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = transformConnectionResults(input)
      expect(result).toEqual(expected)
    })
})
