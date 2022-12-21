import { getPagesForFeatures } from 'uiSrc/utils/highlighting'
import { MOCKED_HIGHLIGHTING_FEATURES } from 'uiSrc/utils/test-utils'

describe('getPagesForFeatures', () => {
  it('should return proper pages for features', () => {
    expect(getPagesForFeatures()).toEqual({})
    expect(getPagesForFeatures([])).toEqual({})
    expect(getPagesForFeatures(['a'])).toEqual({})
    expect(getPagesForFeatures(['importDatabases'])).toEqual({ browser: ['importDatabases'] })
    expect(getPagesForFeatures(MOCKED_HIGHLIGHTING_FEATURES)).toEqual({ browser: MOCKED_HIGHLIGHTING_FEATURES })
  })
})
