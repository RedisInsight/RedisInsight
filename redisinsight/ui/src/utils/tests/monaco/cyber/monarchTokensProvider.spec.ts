import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/cypherTokens'
import { getJmespathMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/jmespathTokens'
import { getSqliteFunctionsMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/sqliteFunctionsTokens'

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
