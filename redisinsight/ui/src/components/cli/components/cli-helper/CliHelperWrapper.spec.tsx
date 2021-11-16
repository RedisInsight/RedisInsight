import { cloneDeep } from 'lodash'
import React from 'react'
import { cliSettingsSelector } from 'uiSrc/slices/cli/cli-settings'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { ICommands, MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import CliHelperWrapper from './CliHelperWrapper'

const ALL_REDIS_COMMANDS: ICommands = MOCK_COMMANDS_SPEC
const redisCommandsPath = 'uiSrc/slices/app/redis-commands'
const cliHelperTestId = 'cli-helper'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/cli/cli-settings', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-settings'),
  cliSettingsSelector: jest.fn().mockReturnValue({
    matchedCommand: '',
    isSearching: false,
    isEnteringCommand: false,
    searchedCommand: '',
    searchingCommand: '',
  }),
}))

jest.mock(redisCommandsPath, () => {
  const defaultState = jest.requireActual(redisCommandsPath).initialState
  const { MOCK_COMMANDS_SPEC, MOCK_COMMANDS_ARRAY } = jest.requireActual('uiSrc/constants')
  return {
    ...jest.requireActual(redisCommandsPath),
    appRedisCommandsSelector: jest.fn().mockReturnValue({
      ...defaultState,
      spec: MOCK_COMMANDS_SPEC,
      commandsArray: MOCK_COMMANDS_ARRAY
    }),
  }
})

interface IMockedCommands {
  matchedCommand: string;
  argStr?: string;
  argListText?: string;
  complexityShort?: string;
}

const mockedCommands: IMockedCommands[] = [
  {
    matchedCommand: 'xgroup',
    argStr:
      'XGROUP [CREATE key groupname ID|$ [MKSTREAM]] [SETID key groupname ID|$] [DESTROY key groupname] [CREATECONSUMER key groupname consumername] [DELCONSUMER key groupname consumername]',
    argListText:
      'Arguments:[CREATE key groupname id [MKSTREAM]]Optional[SETID key groupname id]Optional[DESTROY key groupname]Optional[CREATECONSUMER key groupname consumername]Optional[DELCONSUMER key groupname consumername]Optional',
  },
  {
    matchedCommand: 'hset',
    argStr: 'HSET key field value [field value ...]',
    argListText: 'Arguments:keyRequiredfield valueMultiple',
  },
  {
    matchedCommand: 'acl setuser',
    argStr: 'ACL SETUSER username [rule [rule ...]]',
    argListText: 'Arguments:usernameRequired[rule]Multiple',
  },
  {
    matchedCommand: 'bitfield',
    argStr:
      'BITFIELD key [GET type offset] [SET type offset value] [INCRBY type offset increment] [OVERFLOW WRAP|SAT|FAIL]',
    argListText:
      'Arguments:keyRequired[GET type offset]Optional[SET type offset value]Optional[INCRBY type offset increment]Optional[OVERFLOW WRAP|SAT|FAIL]Optional',
  },
  {
    matchedCommand: 'client kill',
    argStr:
      'CLIENT KILL [ip:port] [ID client-id] [TYPE normal|master|slave|pubsub] [USER username] [ADDR ip:port] [LADDR ip:port] [SKIPME yes/no]',
    argListText:
      'Arguments:[ip:port]Optional[ID client-id]Optional[TYPE normal|master|slave|pubsub]Optional[USER username]Optional[ADDR ip:port]Optional[LADDR ip:port]Optional[SKIPME yes/no]Optional',
  },
  {
    matchedCommand: 'geoadd',
    argStr: 'GEOADD key [NX|XX] [CH] longitude latitude member [longitude latitude member ...]',
    argListText:
      'Arguments:keyRequired[condition]Optional[change]Optionallongitude latitude memberMultiple',
  },
  {
    matchedCommand: 'zadd',
    argStr: 'ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]',
    argListText:
      'Arguments:keyRequired[condition]Optional[comparison]Optional[change]Optional[increment]Optionalscore memberMultiple',
  },
]

describe('CliBodyWrapper', () => {
  it('should render', () => {
    expect(render(<CliHelperWrapper />)).toBeTruthy()
  })

  it('Title should be rendered according mocked data', () => {
    const titleArgsId = 'cli-helper-title-args'

    mockedCommands.forEach(({ matchedCommand, argStr = '' }) => {
      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CliHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()
      expect(screen.getByTestId(titleArgsId)).toHaveTextContent(argStr)

      unmount()
    })
  })

  it('Arguments list text should be rendered according mocked data', () => {
    const argsId = 'cli-helper-arguments'

    mockedCommands.forEach(({ matchedCommand, argListText = '' }) => {
      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CliHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()
      expect(screen.getByTestId(argsId)).toHaveTextContent(argListText)

      unmount()
    })
  })

  it('Since should be rendered according mocked data', () => {
    const sinceId = 'cli-helper-since'

    mockedCommands.forEach(({ matchedCommand = '' }) => {
      const since = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.since

      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CliHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()
      expect(screen.getByTestId(sinceId)).toHaveTextContent(since)

      unmount()
    })
  })

  it('Complexity should be rendered according mocked data', () => {
    const complexityId = 'cli-helper-complexity'

    mockedCommands.forEach(({ matchedCommand = '' }) => {
      const complexity = ALL_REDIS_COMMANDS[matchedCommand?.toUpperCase()]?.complexity

      cliSettingsSelector.mockImplementation(() => ({
        matchedCommand,
        isEnteringCommand: true,
      }))

      const { unmount } = render(<CliHelperWrapper />)

      expect(screen.getByTestId(cliHelperTestId)).toBeInTheDocument()

      if (complexity) {
        expect(screen.getByTestId(complexityId)).toBeInTheDocument()
        expect(screen.getByTestId(complexityId)).toHaveTextContent(complexity)
      }

      unmount()
    })
  })

  it('should render search results', () => {
    mockedCommands.forEach(({ matchedCommand }) => {
      cliSettingsSelector.mockImplementation(() => ({
        searchingCommand: matchedCommand,
        searchedCommand: '',
        isSearching: true,
      }))
      const { unmount } = render(<CliHelperWrapper />)
      expect(
        screen.getByTestId(`cli-helper-output-title-${matchedCommand.toUpperCase()}`)
      ).toBeInTheDocument()
      unmount()
    })
  })
})
