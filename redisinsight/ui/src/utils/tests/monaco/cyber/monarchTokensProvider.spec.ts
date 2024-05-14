import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/cypherTokens'

describe('getCypherMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getCypherMonarchTokensProvider()).toBeTruthy()
  })
})
