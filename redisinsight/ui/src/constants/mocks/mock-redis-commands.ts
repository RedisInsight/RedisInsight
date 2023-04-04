export const MOCK_COMMANDS_SPEC = {
  SET: {
    summary: 'Set the string value of a key',
    since: '1.0.0',
    group: 'string',
    complexity: 'O(1)',
    history: [
      [
        '2.6.12',
        'Added the `EX`, `PX`, `NX` and `XX` options.'
      ],
      [
        '6.0.0',
        'Added the `KEEPTTL` option.'
      ],
      [
        '6.2.0',
        'Added the `GET`, `EXAT` and `PXAT` option.'
      ],
      [
        '7.0.0',
        'Allowed the `NX` and `GET` options to be used together.'
      ]
    ],
    acl_categories: [
      '@write',
      '@string',
      '@slow'
    ],
    arity: -3,
    key_specs: [
      {
        notes: 'RW and ACCESS due to the optional `GET` argument',
        begin_search: {
          type: 'index',
          spec: {
            index: 1
          }
        },
        find_keys: {
          type: 'range',
          spec: {
            lastkey: 0,
            keystep: 1,
            limit: 0
          }
        },
        RW: true,
        access: true,
        update: true,
        variable_flags: true
      }
    ],
    arguments: [
      {
        name: 'key',
        type: 'key',
        display_text: 'key',
        key_spec_index: 0
      },
      {
        name: 'value',
        type: 'string',
        display_text: 'value'
      },
      {
        name: 'condition',
        type: 'oneof',
        since: '2.6.12',
        optional: true,
        arguments: [
          {
            name: 'nx',
            type: 'pure-token',
            display_text: 'nx',
            token: 'NX'
          },
          {
            name: 'xx',
            type: 'pure-token',
            display_text: 'xx',
            token: 'XX'
          }
        ]
      },
      {
        name: 'get',
        type: 'pure-token',
        display_text: 'get',
        token: 'GET',
        since: '6.2.0',
        optional: true
      },
      {
        name: 'expiration',
        type: 'oneof',
        optional: true,
        arguments: [
          {
            name: 'seconds',
            type: 'integer',
            display_text: 'seconds',
            token: 'EX',
            since: '2.6.12'
          },
          {
            name: 'milliseconds',
            type: 'integer',
            display_text: 'milliseconds',
            token: 'PX',
            since: '2.6.12'
          },
          {
            name: 'unix-time-seconds',
            type: 'unix-time',
            display_text: 'unix-time-seconds',
            token: 'EXAT',
            since: '6.2.0'
          },
          {
            name: 'unix-time-milliseconds',
            type: 'unix-time',
            display_text: 'unix-time-milliseconds',
            token: 'PXAT',
            since: '6.2.0'
          },
          {
            name: 'keepttl',
            type: 'pure-token',
            display_text: 'keepttl',
            token: 'KEEPTTL',
            since: '6.0.0'
          }
        ]
      }
    ],
    command_flags: [
      'write',
      'denyoom'
    ]
  },
  GET: {
    summary: 'Get the value of a key',
    since: '1.0.0',
    group: 'string',
    complexity: 'O(1)',
    acl_categories: [
      '@read',
      '@string',
      '@fast'
    ],
    arity: 2,
    key_specs: [
      {
        begin_search: {
          type: 'index',
          spec: {
            index: 1
          }
        },
        find_keys: {
          type: 'range',
          spec: {
            lastkey: 0,
            keystep: 1,
            limit: 0
          }
        },
        RO: true,
        access: true
      }
    ],
    arguments: [
      {
        name: 'key',
        type: 'key',
        display_text: 'key',
        key_spec_index: 0
      }
    ],
    command_flags: [
      'readonly',
      'fast'
    ]
  },
  HSET: {
    summary: 'Set the string value of a hash field',
    since: '2.0.0',
    group: 'hash',
    complexity: 'O(1) for each field/value pair added, so O(N) to add N field/value pairs when the command is called with multiple field/value pairs.',
    history: [
      [
        '4.0.0',
        'Accepts multiple `field` and `value` arguments.'
      ]
    ],
    acl_categories: [
      '@write',
      '@hash',
      '@fast'
    ],
    arity: -4,
    key_specs: [
      {
        begin_search: {
          type: 'index',
          spec: {
            index: 1
          }
        },
        find_keys: {
          type: 'range',
          spec: {
            lastkey: 0,
            keystep: 1,
            limit: 0
          }
        },
        RW: true,
        update: true
      }
    ],
    arguments: [
      {
        name: 'key',
        type: 'key',
        display_text: 'key',
        key_spec_index: 0
      },
      {
        name: 'data',
        type: 'block',
        multiple: true,
        arguments: [
          {
            name: 'field',
            type: 'string',
            display_text: 'field'
          },
          {
            name: 'value',
            type: 'string',
            display_text: 'value'
          }
        ]
      }
    ],
    command_flags: [
      'write',
      'denyoom',
      'fast'
    ]
  },
  'CLIENT KILL': {
    summary: 'Kill the connection of a client',
    since: '2.4.0',
    group: 'connection',
    complexity: 'O(N) where N is the number of client connections',
    history: [
      [
        '2.8.12',
        'Added new filter format.'
      ],
      [
        '2.8.12',
        '`ID` option.'
      ],
      [
        '3.2.0',
        'Added `master` type in for `TYPE` option.'
      ],
      [
        '5.0.0',
        'Replaced `slave` `TYPE` with `replica`. `slave` still supported for backward compatibility.'
      ],
      [
        '6.2.0',
        '`LADDR` option.'
      ]
    ],
    acl_categories: [
      '@admin',
      '@slow',
      '@dangerous',
      '@connection'
    ],
    arity: -3,
    arguments: [
      {
        name: 'filter',
        type: 'oneof',
        arguments: [
          {
            name: 'old-format',
            type: 'string',
            display_text: 'ip:port',
            deprecated_since: '2.8.12'
          },
          {
            name: 'new-format',
            type: 'oneof',
            multiple: true,
            arguments: [
              {
                name: 'client-id',
                type: 'integer',
                display_text: 'client-id',
                token: 'ID',
                since: '2.8.12',
                optional: true
              },
              {
                name: 'client-type',
                type: 'oneof',
                token: 'TYPE',
                since: '2.8.12',
                optional: true,
                arguments: [
                  {
                    name: 'normal',
                    type: 'pure-token',
                    display_text: 'normal',
                    token: 'NORMAL'
                  },
                  {
                    name: 'master',
                    type: 'pure-token',
                    display_text: 'master',
                    token: 'MASTER',
                    since: '3.2.0'
                  },
                  {
                    name: 'slave',
                    type: 'pure-token',
                    display_text: 'slave',
                    token: 'SLAVE'
                  },
                  {
                    name: 'replica',
                    type: 'pure-token',
                    display_text: 'replica',
                    token: 'REPLICA',
                    since: '5.0.0'
                  },
                  {
                    name: 'pubsub',
                    type: 'pure-token',
                    display_text: 'pubsub',
                    token: 'PUBSUB'
                  }
                ]
              },
              {
                name: 'username',
                type: 'string',
                display_text: 'username',
                token: 'USER',
                optional: true
              },
              {
                name: 'addr',
                type: 'string',
                display_text: 'ip:port',
                token: 'ADDR',
                optional: true
              },
              {
                name: 'laddr',
                type: 'string',
                display_text: 'ip:port',
                token: 'LADDR',
                since: '6.2.0',
                optional: true
              },
              {
                name: 'skipme',
                type: 'oneof',
                token: 'SKIPME',
                optional: true,
                arguments: [
                  {
                    name: 'yes',
                    type: 'pure-token',
                    display_text: 'yes',
                    token: 'YES'
                  },
                  {
                    name: 'no',
                    type: 'pure-token',
                    display_text: 'no',
                    token: 'NO'
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    command_flags: [
      'admin',
      'noscript',
      'loading',
      'stale'
    ]
  },
  XGROUP: {
    summary: 'A container for consumer groups commands',
    since: '5.0.0',
    group: 'stream',
    complexity: 'Depends on subcommand.',
    acl_categories: [
      '@slow'
    ],
    arity: -2
  },
  'ACL SETUSER': {
    summary: 'Modify or create the rules for a specific ACL user',
    since: '6.0.0',
    group: 'server',
    complexity: 'O(N). Where N is the number of rules provided.',
    history: [
      [
        '6.2.0',
        'Added Pub/Sub channel patterns.'
      ],
      [
        '7.0.0',
        'Added selectors and key based permissions.'
      ]
    ],
    acl_categories: [
      '@admin',
      '@slow',
      '@dangerous'
    ],
    arity: -3,
    arguments: [
      {
        name: 'username',
        type: 'string',
        display_text: 'username'
      },
      {
        name: 'rule',
        type: 'string',
        display_text: 'rule',
        optional: true,
        multiple: true
      }
    ],
    command_flags: [
      'admin',
      'noscript',
      'loading',
      'stale'
    ]
  },
  GEOADD: {
    summary: 'Add one or more geospatial items in the geospatial index represented using a sorted set',
    since: '3.2.0',
    group: 'geo',
    complexity: 'O(log(N)) for each item added, where N is the number of elements in the sorted set.',
    history: [
      [
        '6.2.0',
        'Added the `CH`, `NX` and `XX` options.'
      ]
    ],
    acl_categories: [
      '@write',
      '@geo',
      '@slow'
    ],
    arity: -5,
    key_specs: [
      {
        begin_search: {
          type: 'index',
          spec: {
            index: 1
          }
        },
        find_keys: {
          type: 'range',
          spec: {
            lastkey: 0,
            keystep: 1,
            limit: 0
          }
        },
        RW: true,
        update: true
      }
    ],
    arguments: [
      {
        name: 'key',
        type: 'key',
        display_text: 'key',
        key_spec_index: 0
      },
      {
        name: 'condition',
        type: 'oneof',
        since: '6.2.0',
        optional: true,
        arguments: [
          {
            name: 'nx',
            type: 'pure-token',
            display_text: 'nx',
            token: 'NX'
          },
          {
            name: 'xx',
            type: 'pure-token',
            display_text: 'xx',
            token: 'XX'
          }
        ]
      },
      {
        name: 'change',
        type: 'pure-token',
        display_text: 'change',
        token: 'CH',
        since: '6.2.0',
        optional: true
      },
      {
        name: 'data',
        type: 'block',
        multiple: true,
        arguments: [
          {
            name: 'longitude',
            type: 'double',
            display_text: 'longitude'
          },
          {
            name: 'latitude',
            type: 'double',
            display_text: 'latitude'
          },
          {
            name: 'member',
            type: 'string',
            display_text: 'member'
          }
        ]
      }
    ],
    command_flags: [
      'write',
      'denyoom'
    ]
  },
  ZADD: {
    summary: 'Add one or more members to a sorted set, or update its score if it already exists',
    since: '1.2.0',
    group: 'sorted-set',
    complexity: 'O(log(N)) for each item added, where N is the number of elements in the sorted set.',
    history: [
      [
        '2.4.0',
        'Accepts multiple elements.'
      ],
      [
        '3.0.2',
        'Added the `XX`, `NX`, `CH` and `INCR` options.'
      ],
      [
        '6.2.0',
        'Added the `GT` and `LT` options.'
      ]
    ],
    acl_categories: [
      '@write',
      '@sortedset',
      '@fast'
    ],
    arity: -4,
    key_specs: [
      {
        begin_search: {
          type: 'index',
          spec: {
            index: 1
          }
        },
        find_keys: {
          type: 'range',
          spec: {
            lastkey: 0,
            keystep: 1,
            limit: 0
          }
        },
        RW: true,
        update: true
      }
    ],
    arguments: [
      {
        name: 'key',
        type: 'key',
        display_text: 'key',
        key_spec_index: 0
      },
      {
        name: 'condition',
        type: 'oneof',
        since: '3.0.2',
        optional: true,
        arguments: [
          {
            name: 'nx',
            type: 'pure-token',
            display_text: 'nx',
            token: 'NX'
          },
          {
            name: 'xx',
            type: 'pure-token',
            display_text: 'xx',
            token: 'XX'
          }
        ]
      },
      {
        name: 'comparison',
        type: 'oneof',
        since: '6.2.0',
        optional: true,
        arguments: [
          {
            name: 'gt',
            type: 'pure-token',
            display_text: 'gt',
            token: 'GT'
          },
          {
            name: 'lt',
            type: 'pure-token',
            display_text: 'lt',
            token: 'LT'
          }
        ]
      },
      {
        name: 'change',
        type: 'pure-token',
        display_text: 'change',
        token: 'CH',
        since: '3.0.2',
        optional: true
      },
      {
        name: 'increment',
        type: 'pure-token',
        display_text: 'increment',
        token: 'INCR',
        since: '3.0.2',
        optional: true
      },
      {
        name: 'data',
        type: 'block',
        multiple: true,
        arguments: [
          {
            name: 'score',
            type: 'double',
            display_text: 'score'
          },
          {
            name: 'member',
            type: 'string',
            display_text: 'member'
          }
        ]
      }
    ],
    command_flags: [
      'write',
      'denyoom',
      'fast'
    ]
  },
  RESET: {
    summary: 'Reset the connection',
    since: '6.2.0',
    group: 'connection',
    complexity: 'O(1)',
    acl_categories: [
      '@fast',
      '@connection'
    ],
    arity: 1,
    command_flags: [
      'noscript',
      'loading',
      'stale',
      'fast',
      'no_auth',
      'allow_busy'
    ]
  },
  BITFIELD: {
    summary: 'Perform arbitrary bitfield integer operations on strings',
    since: '3.2.0',
    group: 'bitmap',
    complexity: 'O(1) for each subcommand specified',
    acl_categories: [
      '@write',
      '@bitmap',
      '@slow'
    ],
    arity: -2,
    key_specs: [
      {
        notes: 'This command allows both access and modification of the key',
        begin_search: {
          type: 'index',
          spec: {
            index: 1
          }
        },
        find_keys: {
          type: 'range',
          spec: {
            lastkey: 0,
            keystep: 1,
            limit: 0
          }
        },
        RW: true,
        access: true,
        update: true,
        variable_flags: true
      }
    ],
    arguments: [
      {
        name: 'key',
        type: 'key',
        display_text: 'key',
        key_spec_index: 0
      },
      {
        name: 'operation',
        type: 'oneof',
        optional: true,
        multiple: true,
        arguments: [
          {
            name: 'get-block',
            type: 'block',
            token: 'GET',
            arguments: [
              {
                name: 'encoding',
                type: 'string',
                display_text: 'encoding'
              },
              {
                name: 'offset',
                type: 'integer',
                display_text: 'offset'
              }
            ]
          },
          {
            name: 'write',
            type: 'block',
            arguments: [
              {
                name: 'overflow-block',
                type: 'oneof',
                token: 'OVERFLOW',
                optional: true,
                arguments: [
                  {
                    name: 'wrap',
                    type: 'pure-token',
                    display_text: 'wrap',
                    token: 'WRAP'
                  },
                  {
                    name: 'sat',
                    type: 'pure-token',
                    display_text: 'sat',
                    token: 'SAT'
                  },
                  {
                    name: 'fail',
                    type: 'pure-token',
                    display_text: 'fail',
                    token: 'FAIL'
                  }
                ]
              },
              {
                name: 'write-operation',
                type: 'oneof',
                arguments: [
                  {
                    name: 'set-block',
                    type: 'block',
                    token: 'SET',
                    arguments: [
                      {
                        name: 'encoding',
                        type: 'string',
                        display_text: 'encoding'
                      },
                      {
                        name: 'offset',
                        type: 'integer',
                        display_text: 'offset'
                      },
                      {
                        name: 'value',
                        type: 'integer',
                        display_text: 'value'
                      }
                    ]
                  },
                  {
                    name: 'incrby-block',
                    type: 'block',
                    token: 'INCRBY',
                    arguments: [
                      {
                        name: 'encoding',
                        type: 'string',
                        display_text: 'encoding'
                      },
                      {
                        name: 'offset',
                        type: 'integer',
                        display_text: 'offset'
                      },
                      {
                        name: 'increment',
                        type: 'integer',
                        display_text: 'increment'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    command_flags: [
      'write',
      'denyoom'
    ]
  },
}

export const MOCK_COMMANDS_ARRAY = Object.keys(MOCK_COMMANDS_SPEC).sort()
