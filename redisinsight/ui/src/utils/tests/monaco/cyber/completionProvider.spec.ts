import { getCypherCompletionProvider } from 'uiSrc/utils/monaco/cypher/completionProvider'

describe('getCypherCompletionProvider', () => {
  it('should call getWordUntilPosition and getValueInRange', () => {
    const provider = getCypherCompletionProvider()

    const positionMock = {}
    const contextMock = {}
    const tokenMock = {}

    const modelMock = {
      getWordUntilPosition: jest.fn().mockImplementation(() => ({})),
      getValueInRange: jest.fn().mockImplementation(() => ('')),
    }

    provider.provideCompletionItems(modelMock, positionMock, contextMock, tokenMock)

    expect(modelMock.getWordUntilPosition).toBeCalled()
    expect(modelMock.getValueInRange).toBeCalled()
  })
})
