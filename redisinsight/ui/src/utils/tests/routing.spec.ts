import { getPageName, getRedirectionPage } from 'uiSrc/utils/routing'

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
  { input: ['/workbench?guidePath=introduction.md', databaseId], expected: '/1/workbench?guidePath=introduction.md&insights=open' },
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

const getPageNameTests = [
  { input: ['instanceId', '/instanceId/page1'], expected: '/page1' },
  { input: ['instanceId', '/instanceId/page1/page2'], expected: '/page1/page2' },
  { input: ['instanceId', '/page1'], expected: '/page1' },
]

describe('getPageName', () => {
  test.each(getPageNameTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = getPageName(...input)
      expect(result).toEqual(expected)
    }
  )
})
