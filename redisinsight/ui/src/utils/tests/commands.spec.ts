import { CommandGroup, ICommandArgGenerated, ICommands, MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { generateArgs, generateArgsNames, getComplexityShortNotation, getDocUrlForCommand } from '../commands'
import { cleanup } from '../test-utils'

const ALL_REDIS_COMMANDS: ICommands = MOCK_COMMANDS_SPEC

interface IMockedCommands {
  matchedCommand: string;
  argStr?: string;
  argsNamesWithEnumsMock?: string[];
  argsNamesMock?: string[];
  complexityShortMock?: string;
}

beforeEach(() => {
  cleanup()
})

const mockedCommands: IMockedCommands[] = [
  {
    matchedCommand: 'xgroup',
    argStr:
      'XGROUP [CREATE key groupname ID|$ [MKSTREAM]] [SETID key groupname ID|$] [DESTROY key groupname] [CREATECONSUMER key groupname consumername] [DELCONSUMER key groupname consumername]',
    argsNamesWithEnumsMock: [
      '[CREATE key groupname ID|$ [MKSTREAM]]',
      '[SETID key groupname ID|$]',
      '[DESTROY key groupname]',
      '[CREATECONSUMER key groupname consumername]',
      '[DELCONSUMER key groupname consumername]',
    ],
    argsNamesMock: [
      '[CREATE key groupname id [MKSTREAM]]',
      '[SETID key groupname id]',
      '[DESTROY key groupname]',
      '[CREATECONSUMER key groupname consumername]',
      '[DELCONSUMER key groupname consumername]',
    ],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'hset',
    argStr: 'HSET key field value [field value ...]',
    argsNamesWithEnumsMock: ['key', 'field', 'value', '[field value ...]'],
    argsNamesMock: ['key', 'field value'],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'acl setuser',
    argStr: 'ACL SETUSER username [rule [rule ...]]',
    argsNamesWithEnumsMock: ['username', '[rule [rule ...]]'],
    argsNamesMock: ['username', '[rule]'],
    complexityShortMock: 'O(N)',
  },
  {
    matchedCommand: 'bitfield',
    argStr:
      'BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]',
    argsNamesWithEnumsMock: [
      'key',
      '[GET type offset]',
      '[SET type offset value]',
      '[INCRBY type offset increment]',
      '[OVERFLOW WRAP|SAT|FAIL]',
    ],
    argsNamesMock: [
      'key',
      '[GET type offset]',
      '[SET type offset value]',
      '[INCRBY type offset increment]',
      '[OVERFLOW WRAP|SAT|FAIL]',
    ],
    complexityShortMock: 'O(1)',
  },
  {
    matchedCommand: 'client kill',
    argStr:
      'CLIENT KILL [ip:port] [ID client-id] [TYPE normal|master|slave|pubsub] [USER username] [ADDR ip:port] [LADDR ip:port] [SKIPME yes/no]',
    argsNamesWithEnumsMock: [
      '[ip:port]',
      '[ID client-id]',
      '[TYPE normal|master|slave|pubsub]',
      '[USER username]',
      '[ADDR ip:port]',
      '[LADDR ip:port]',
      '[SKIPME yes/no]',
    ],
    argsNamesMock: [
      '[ip:port]',
      '[ID client-id]',
      '[TYPE normal|master|slave|pubsub]',
      '[USER username]',
      '[ADDR ip:port]',
      '[LADDR ip:port]',
      '[SKIPME yes/no]',
    ],
    complexityShortMock: 'O(N)',
  },
  {
    matchedCommand: 'geoadd',
    argStr: 'GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member ...]',
    argsNamesWithEnumsMock: [
      'key',
      '[NX|XX]',
      '[CH]',
      'longitude',
      'latitude',
      'member',
      '[longitude latitude member ...]',
    ],
    argsNamesMock: ['key', '[condition]', '[change]', 'longitude latitude member'],
    complexityShortMock: 'O(log(N))',
  },
  {
    matchedCommand: 'zadd',
    argStr: 'ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]',
    argsNamesWithEnumsMock: [
      'key',
      '[NX|XX]',
      '[GT|LT]',
      '[CH]',
      '[INCR]',
      'score',
      'member',
      '[score member ...]',
    ],
    argsNamesMock: [
      'key',
      '[condition]',
      '[comparison]',
      '[change]',
      '[increment]',
      'score member',
    ],
    complexityShortMock: 'O(log(N))',
  },
]

describe('getComplexityShortNotation', () => {
  it('Complexity short should return text according mocked data', () => {
    mockedCommands.forEach(({ matchedCommand = '', complexityShortMock }) => {
      const complexity = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.complexity ?? ''
      const complexityShort = getComplexityShortNotation(complexity)

      if (complexityShort) {
        expect(complexityShort).toEqual(complexityShortMock)
      } else {
        expect(complexityShort).toEqual('')
      }
    })
  })
  it('handle case when complexity is array of strings', () => {
    const result = getComplexityShortNotation([
      'O(1) for each field/value pair added',
      'O(N) to add N field/value pairs when the command is called with multiple field/value pairs.'
    ])

    expect(result).toEqual('')
  })
})

describe('generateArgs', () => {
  it('generateArgs short should return argument with GeneratedName (with Enums names)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesMock = [] }) => {
      const argsInit = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const argsMocked: ICommandArgGenerated[] = argsInit.map((arg, i) => ({
        ...arg,
        generatedName: argsNamesMock[i] ?? '',
      }))

      const args = generateArgs(argsInit)

      expect(args).toEqual(argsMocked)
    })
  })
})

describe('generateArgName', () => {
  it('Arguments names should return text according mocked data (with Enums values)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesWithEnumsMock }) => {
      const args = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const generatedArgNames = generateArgsNames(args)
      expect(generatedArgNames).toEqual(argsNamesWithEnumsMock)
    })
  })
  it('Arguments names should return text according mocked data (with Enums names)', () => {
    mockedCommands.forEach(({ matchedCommand = '', argsNamesMock }) => {
      const args = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.arguments ?? []

      const generatedArgNames = generateArgsNames(args, true)
      expect(generatedArgNames).toEqual(argsNamesMock)
    })
  })
})

const getDocUrlForCommandTests: any[] = [
  ['SET', CommandGroup.String, 'https://redis.io/commands/set'],
  ['ACL SETUSER', CommandGroup.Server, 'https://redis.io/commands/acl-setuser'],
  ['JSON.GET', CommandGroup.JSON, 'https://oss.redis.com/redisjson/commands/#jsonget'],
  ['FT.CREATE', CommandGroup.Search, 'https://oss.redis.com/redisearch/Commands/#ftcreate'],
  ['FT.ALTER SCHEMA ADD', CommandGroup.Search, 'https://oss.redis.com/redisearch/Commands/#ftalter_schema_add'],
  ['TS.ADD', CommandGroup.TimeSeries, 'https://oss.redis.com/redistimeseries/commands/#tsadd'],
  ['TS.CREATE', CommandGroup.TimeSeries, 'https://oss.redis.com/redistimeseries/commands/#tscreate'],
  ['GRAPH.EXPLAIN', CommandGroup.Graph, 'https://oss.redis.com/redisgraph/commands/#graphexplain'],
  ['GRAPH.QUERY', CommandGroup.Graph, 'https://oss.redis.com/redisgraph/commands/#graphquery'],
  ['AI.MODELRUN', CommandGroup.AI, 'https://oss.redis.com/redisai/commands/#aimodelrun'],
  ['AI.SCRIPTDEL', CommandGroup.AI, 'https://oss.redis.com/redisai/commands/#aiscriptdel'],
  ['NON EXIST COMMAND', 'non-exist', 'https://redis.io/commands/non-exist-command'],
]

describe('getDocUrlForCommand', () => {
  it.each(getDocUrlForCommandTests)('for input: %s (command), %s (group), should be output: %s',
    (command, group, expected) => {
      const result = getDocUrlForCommand(command, group)
      expect(result).toBe(expected)
    })
})
