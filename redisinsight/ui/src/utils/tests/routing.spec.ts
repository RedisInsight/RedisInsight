import { getRedirectionPage } from 'uiSrc/utils/routing'

jest.mock('uiSrc/utils/routing', () => ({
  ...jest.requireActual('uiSrc/utils/routing')
}))

const databaseId = '1'
const getRedirectionPageTests = [
  { input: ['settings'], expected: '/settings' },
  { input: ['workbench', databaseId], expected: '/1/workbench' },
  { input: ['/workbench', databaseId], expected: '/1/workbench' },
  { input: ['/analytics/slowlog', databaseId], expected: '/1/analytics/slowlog' },
  { input: ['/analytics/slowlog'], expected: null },
  { input: ['/analytics', databaseId], expected: '/1/analytics' },
  { input: ['/analytics/page', databaseId], expected: null },
]

describe('getRedirectionPage', () => {
  test.each(getRedirectionPageTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getRedirectionPage(...input)
      expect(result).toEqual(expected)
    }
  )
})
