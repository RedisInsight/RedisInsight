import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/cypherTokens'
import { getJmespathMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/jmespathTokens'
import { getSqliteFunctionsMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/sqliteFunctionsTokens'
import { getRediSearchMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokens'
import { MOCKED_SUPPORTED_COMMANDS } from 'uiSrc/pages/search/mocks/mocks'

describe('getCypherMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getCypherMonarchTokensProvider()).toBeTruthy()
  })
})

describe('getJmespathMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getJmespathMonarchTokensProvider([])).toBeTruthy()
  })
})

describe('getSqliteFunctionsMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getSqliteFunctionsMonarchTokensProvider([])).toBeTruthy()
  })
})

describe('getRediSearchMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getRediSearchMonarchTokensProvider([])).toBeTruthy()
  })

  it('should be truthy with command', () => {
    const commands = Object.keys(MOCKED_SUPPORTED_COMMANDS)
      .map((key) => ({
        ...MOCKED_SUPPORTED_COMMANDS[key],
        name: key
      }))
    expect(getRediSearchMonarchTokensProvider(commands, 'FT.AGGREGATE')).toBeTruthy()
  })
})
