export const MOCK_COMMANDS_SPEC = {
  SET: {
    summary: 'Set the string value of a key',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'key',
        type: 'key'
      },
      {
        name: 'value',
        type: 'string'
      },
      {
        name: 'expiration',
        type: 'enum',
        enum: [
          'EX seconds',
          'PX milliseconds',
          'EXAT timestamp',
          'PXAT milliseconds-timestamp',
          'KEEPTTL'
        ],
        optional: true
      },
      {
        name: 'condition',
        type: 'enum',
        enum: [
          'NX',
          'XX'
        ],
        optional: true
      },
      {
        name: 'get',
        type: 'enum',
        enum: [
          'GET'
        ],
        optional: true
      }
    ],
    since: '1.0.0',
    group: 'string'
  },
  GET: {
    summary: 'Get the value of a key',
    complexity: 'O(1)',
    arguments: [
      {
        name: 'key',
        type: 'key'
      }
    ],
    since: '1.0.0',
    group: 'string'
  },
  HSET: {
    summary: 'Set the string value of a hash field',
    complexity: 'O(1) for each field/value pair added, so O(N) to add N field/value pairs when the command is called with multiple field/value pairs.',
    arguments: [
      {
        name: 'key',
        type: 'key'
      },
      {
        name: [
          'field',
          'value'
        ],
        type: [
          'string',
          'string'
        ],
        multiple: true
      }
    ],
    since: '2.0.0',
    group: 'hash'
  },
  'CLIENT KILL': {
    summary: 'Kill the connection of a client',
    complexity: 'O(N) where N is the number of client connections',
    arguments: [
      {
        name: 'ip:port',
        type: 'string',
        optional: true
      },
      {
        command: 'ID',
        name: 'client-id',
        type: 'integer',
        optional: true
      },
      {
        command: 'TYPE',
        type: 'enum',
        enum: [
          'normal',
          'master',
          'slave',
          'pubsub'
        ],
        optional: true
      },
      {
        command: 'USER',
        name: 'username',
        type: 'string',
        optional: true
      },
      {
        command: 'ADDR',
        name: 'ip:port',
        type: 'string',
        optional: true
      },
      {
        command: 'LADDR',
        name: 'ip:port',
        type: 'string',
        optional: true
      },
      {
        command: 'SKIPME',
        name: 'yes/no',
        type: 'string',
        optional: true
      }
    ],
    since: '2.4.0',
    group: 'connection'
  },
  XGROUP: {
    summary: 'Create, destroy, and manage consumer groups.',
    complexity: 'O(1) for all the subcommands, with the exception of the DESTROY subcommand which takes an additional O(M) time in order to delete the M entries inside the consumer group pending entries list (PEL).',
    arguments: [
      {
        name: 'create',
        type: 'block',
        block: [
          {
            command: 'CREATE',
            name: [
              'key',
              'groupname'
            ],
            type: [
              'key',
              'string'
            ]
          },
          {
            name: 'id',
            type: 'enum',
            enum: [
              'ID',
              '$'
            ]
          },
          {
            command: 'MKSTREAM',
            optional: true
          }
        ],
        optional: true
      },
      {
        name: 'setid',
        type: 'block',
        block: [
          {
            command: 'SETID',
            name: [
              'key',
              'groupname'
            ],
            type: [
              'key',
              'string'
            ]
          },
          {
            name: 'id',
            type: 'enum',
            enum: [
              'ID',
              '$'
            ]
          }
        ],
        optional: true
      },
      {
        command: 'DESTROY',
        name: [
          'key',
          'groupname'
        ],
        type: [
          'key',
          'string'
        ],
        optional: true
      },
      {
        command: 'CREATECONSUMER',
        name: [
          'key',
          'groupname',
          'consumername'
        ],
        type: [
          'key',
          'string',
          'string'
        ],
        optional: true
      },
      {
        command: 'DELCONSUMER',
        name: [
          'key',
          'groupname',
          'consumername'
        ],
        type: [
          'key',
          'string',
          'string'
        ],
        optional: true
      }
    ],
    since: '5.0.0',
    group: 'stream'
  },
  'ACL SETUSER': {
    summary: 'Modify or create the rules for a specific ACL user',
    complexity: 'O(N). Where N is the number of rules provided.',
    arguments: [
      {
        name: 'username',
        type: 'string'
      },
      {
        name: 'rule',
        type: 'string',
        multiple: true,
        optional: true
      }
    ],
    since: '6.0.0',
    group: 'server'
  },
  GEOADD: {
    summary: 'Add one or more geospatial items in the geospatial index represented using a sorted set',
    complexity: 'O(log(N)) for each item added, where N is the number of elements in the sorted set.',
    arguments: [
      {
        name: 'key',
        type: 'key'
      },
      {
        name: 'condition',
        type: 'enum',
        enum: [
          'NX',
          'XX'
        ],
        optional: true
      },
      {
        name: 'change',
        type: 'enum',
        enum: [
          'CH'
        ],
        optional: true
      },
      {
        name: [
          'longitude',
          'latitude',
          'member'
        ],
        type: [
          'double',
          'double',
          'string'
        ],
        multiple: true
      }
    ],
    since: '3.2.0',
    group: 'geo'
  },
  ZADD: {
    summary: 'Add one or more members to a sorted set, or update its score if it already exists',
    complexity: 'O(log(N)) for each item added, where N is the number of elements in the sorted set.',
    arguments: [
      {
        name: 'key',
        type: 'key'
      },
      {
        name: 'condition',
        type: 'enum',
        enum: [
          'NX',
          'XX'
        ],
        optional: true
      },
      {
        name: 'comparison',
        type: 'enum',
        enum: [
          'GT',
          'LT'
        ],
        optional: true
      },
      {
        name: 'change',
        type: 'enum',
        enum: [
          'CH'
        ],
        optional: true
      },
      {
        name: 'increment',
        type: 'enum',
        enum: [
          'INCR'
        ],
        optional: true
      },
      {
        name: [
          'score',
          'member'
        ],
        type: [
          'double',
          'string'
        ],
        multiple: true
      }
    ],
    since: '1.2.0',
    group: 'sorted_set'
  },
  RESET: {
    summary: 'Reset the connection',
    since: '6.2',
    group: 'connection'
  },
  BITFIELD: {
    summary: 'Perform arbitrary bitfield integer operations on strings',
    complexity: 'O(1) for each subcommand specified',
    arguments: [
      {
        name: 'key',
        type: 'key'
      },
      {
        command: 'GET',
        name: [
          'type',
          'offset'
        ],
        type: [
          'type',
          'integer'
        ],
        optional: true
      },
      {
        command: 'SET',
        name: [
          'type',
          'offset',
          'value'
        ],
        type: [
          'type',
          'integer',
          'integer'
        ],
        optional: true
      },
      {
        command: 'INCRBY',
        name: [
          'type',
          'offset',
          'increment'
        ],
        type: [
          'type',
          'integer',
          'integer'
        ],
        optional: true
      },
      {
        command: 'OVERFLOW',
        type: 'enum',
        enum: [
          'WRAP',
          'SAT',
          'FAIL'
        ],
        optional: true
      }
    ],
    since: '3.2.0',
    group: 'bitmap'
  }
}

export const MOCK_COMMANDS_ARRAY = Object.keys(MOCK_COMMANDS_SPEC).sort()
