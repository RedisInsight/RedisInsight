const ingest = {
  title: 'Ingest Job Definition',
  type: 'object',
  properties: {
    source: {
      oneOf: [
        { $ref: '#/$defs/ingest_schema' },
        { $ref: '#/$defs/redis_schema' },
      ]
    },
    transform: {
      title: 'Transformation steps',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          uses: { title: 'Block name', type: 'string' },
          with: {
            title: 'Block arguments',
            type: 'object'
          }
        },
        required: ['uses', 'with'],
        additionalProperties: false
      }
    },
    output: {
      title: 'Output definitions',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          uses: {
            title: 'Output writer',
            type: 'string',
            enum: ['cassandra.write', 'redis.write', 'relational.write']
          },
          with: {
            title: 'Output writer arguments',
            type: 'object',
            properties: {
              nest: {
                $ref: '#/$defs/redis.write_with-nest'
              },
              connection: {
                title: 'Target database connection',
                type: 'string',
                default: 'target'
              },
              keyspace: {
                type: 'string',
                title: 'Keyspace',
                description: 'Keyspace',
                examples: ['employees']
              },
              key: {
                title: 'key',
                description: 'Expression to form the target Redis key when using redis.write block',
                type: 'object'
              },
              keys: {
                title: 'keys',
                description: 'List of fields to uniquely identify target record when using relational.write block',
                type: 'array'
              },
              data_type: {
                title: 'Target data type',
                description: '',
                type: 'string',
                enum: [
                  'hash',
                  'json',
                  'set',
                  'sorted_set',
                  'stream',
                  'string'
                ],
                default: 'hash'
              },
              schema: {
                type: 'string',
                title: 'The table schema of the target table',
                description: 'If left blank, the default schema of this connection will be used as defined in the `connections.yaml`',
                examples: ['dbo']
              },
              table: {
                type: 'string',
                title: 'The target table name',
                description: 'Target table name',
                examples: ['employees']
              },
              mapping: {
                title: 'Fields to write',
                type: 'array',
                items: {
                  type: ['string', 'object'],
                  title: 'Name of column'
                }
              },
              foreach: {
                type: 'string',
                title: 'Split a column into multiple records with a JMESPath expression',
                description: 'Use a JMESPath expression to split a column into multiple records. The expression should be in the format column: expression.',
                pattern: '^(?!:).*:.*(?<!:)$',
                examples: ['order_line: lines[]']
              },
              args: {
                title: 'Arguments for Redis writers',
                type: 'object'
              },
              options: {
                title: 'Redis writer options passed to the writer',
                type: 'array',
                default: []
              },
              on_update: {
                title: 'Target update strategy',
                type: 'string',
                enum: ['merge', 'replace'],
                default: 'replace'
              },
              expire: {
                $ref: '#/$defs/output_definition/expire'
              }
            },
            oneOf: [
              { required: ['nest'] },
              {
                anyOf: [
                  { required: ['key'] },
                  { required: ['data_type'] }
                ]
              },
              { required: ['keys'] }
            ],
            dependentSchemas: {
              mapping: {
                properties: {
                  data_type: { enum: ['hash', 'json', 'stream'] }
                }
              }
            },
            // allOf: [{ $ref: '#/$defs/supported-arguments-for-sets' }],
            additionalProperties: false
          }
        },
        required: ['uses', 'with'],
        additionalProperties: false
      }
    }
  },
  required: ['source'],
  additionalProperties: false,
  $defs: {
    redis_schema: {
      title: 'Source for Write behind (Redis)',
      type: 'object',
      properties: {
        redis: {
          title: 'Redis config',
          type: 'object',
          properties: {
            key_pattern: {
              type: 'string',
              default: 'orderdetail:*'
            },
            trigger: {
              type: 'string',
              default: 'write-behind'
            },
            exclude_commands: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          },
          additionalProperties: false,
          required: ['key_pattern', 'trigger', 'exclude_commands'],
        },
      },
      additionalProperties: false,
      required: ['redis']
    },

    ingest_schema: {
      title: 'Source for Ingest',
      type: 'object',
      properties: {
        case_insensitive: {
          $ref: '#/$defs/source_definition/case_insensitive'
        },
        server_name: {
          $ref: '#/$defs/source_definition/server_name'
        },
        db: {
          $ref: '#/$defs/source_definition/db'
        },
        schema: {
          $ref: '#/$defs/source_definition/schema'
        },
        table: {
          $ref: '#/$defs/source_definition/table'
        },
        row_format: {
          $ref: '#/$defs/row_format'
        }
      },
      required: ['table'],
      additionalProperties: false
    },

    row_format: {
      title: 'Format of the data to be transformed: data_only - only payload, full - complete change record',
      type: 'string',
      enum: ['data_only', 'full']
    },
    source_definition: {
      case_insensitive: {
        title: 'Case insensitive comparison',
        type: 'boolean',
        default: true
      },
      server_name: {
        title: 'Collector logical server name',
        type: 'string'
      },
      db: {
        title: 'DB name',
        type: 'string'
      },
      schema: {
        title: 'DB schema name',
        type: 'string'
      },
      table: {
        title: 'DB table name',
        type: 'string',
        default: 'table'
      },
      redis_key_pattern: {
        title: 'Redis key pattern',
        type: 'string'
      }
    },
    output_definition: {
      expire: {
        title: 'TTL in seconds for the target key in Redis database',
        type: 'integer',
        minimum: 0,
        default: '0'
      }
    },
    'redis.write_with-nest': {
      title: 'Redis nesting settings',
      type: 'object',
      properties: {
        parent: {
          type: 'object',
          title: 'Parent Source',
          description: 'Parent collection to be used for child objects nesting',
          properties: {
            server_name: {
              $ref: '#/$defs/source_definition/server_name'
            },
            schema: {
              $ref: '#/$defs/source_definition/schema'
            },
            table: {
              $ref: '#/$defs/source_definition/table'
            }
          },
          required: ['table'],
          additionalProperties: false
        },
        parent_key: {
          description: 'Foreign key field that is used to identify the parent record',
          type: 'string',
          examples: ['InvoiceId']
        },
        child_key: {
          description: 'Foreign key field in a child table, if different from the parent_key',
          type: 'string',
          examples: ['ParentInvoiceId']
        },
        nesting_key: {
          description: 'Primary key that is used to identify child element in a parent collection',
          type: 'string',
          examples: ['InvoiceLineId']
        },
        path: {
          description: 'Path used to embed child elements to a parent object',
          type: 'string',
          pattern: '^\\$\\.[a-zA-Z0-9_]+$',
          examples: ['$.InvoiceLineItems']
        },
        structure: {
          description: 'Structure type used to embed children objects',
          type: 'string',
          enum: ['map'],
          default: 'map'
        }
      },
      required: ['parent', 'parent_key', 'nesting_key', 'path'],
      additionalProperties: false
    },
    'supported-arguments-for-sets': {
      if: {
        properties: { data_type: { const: 'set' } },
        required: ['data_type']
      },
      then: {
        properties: {
          args: {
            properties: {
              member: {
                type: 'string'
              }
            },
            required: ['member'],
            additionalProperties: false
          }
        },
        required: ['args']
      }
    }
  }
}

export default {
  data: {
    ingest,
  }
}
