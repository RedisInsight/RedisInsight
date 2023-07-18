import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/cypher/monarchTokensProvider'

describe('getCypherMonarchTokensProvider', () => {
  it('should be truthy', () => {
    expect(getCypherMonarchTokensProvider()).toBeTruthy()
  })
})
