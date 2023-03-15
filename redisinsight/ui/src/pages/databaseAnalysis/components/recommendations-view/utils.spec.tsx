import { render, screen } from 'uiSrc/utils/test-utils'
import { sortRecommendations, replaceVariables, renderBadgesLegend, renderBadges } from './utils'

const sortRecommendationsTests = [
  {
    input: [],
    expected: []
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
      { name: 'redisSearch' },
    ],
    expected: [
      { name: 'redisSearch' },
      { name: 'searchIndexes' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ]
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'redisSearch' },
    ],
    expected: [
      { name: 'redisSearch' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ]
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
      { name: 'redisSearch' },
      { name: 'useSmallerKeys' },
      { name: 'RTS' },
    ],
    expected: [
      { name: 'redisSearch' },
      { name: 'searchIndexes' },
      { name: 'bigSets' },
      { name: 'RTS' },
      { name: 'luaScript' },
      { name: 'useSmallerKeys' },
    ]
  },
]

const replaceVariablesTests = [
  { input: ['value'], expected: 'value' },
  // eslint-disable-next-line no-template-curly-in-string
  { input: ['some ${0} text ${1}', ['foo', 'bar'], { foo: '7', bar: 'bar' }], expected: 'some 7 text bar' },
  { input: ['value'], expected: 'value' },
  { input: ['value'], expected: 'value' },
]

describe('renderBadgesLegend', () => {
  const renderedBadgesLegend = renderBadgesLegend()
  render(renderedBadgesLegend)

  expect(screen.queryByTestId('badges-legend')).toBeInTheDocument()
})

describe('sortRecommendations', () => {
  test.each(sortRecommendationsTests)(
    '%j',
    ({ input, expected }) => {
      const result = sortRecommendations(input)
      expect(result).toEqual(expected)
    }
  )
})

describe('renderBadges', () => {
  it('should render "code_changes" badge', () => {
    const renderedBadges = renderBadges(['code_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
  })

  it('should render "configuration_changes" badge', () => {
    const renderedBadges = renderBadges(['configuration_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
  })

  it('should render "code_changes" badge', () => {
    const renderedBadges = renderBadges(['code_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
  })

  it('should render "upgrade" badge', () => {
    const renderedBadges = renderBadges(['upgrade'])
    render(renderedBadges)

    expect(screen.queryByTestId('upgrade')).toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
  })

  it('should render all badges', () => {
    const renderedBadges = renderBadges(['upgrade', 'configuration_changes', 'code_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('upgrade')).toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
  })
})

describe('replaceVariables', () => {
  test.each(replaceVariablesTests)(
    '%j',
    ({ input, expected }) => {
      // @ts-ignore
      const result = replaceVariables(...input)
      expect(result).toEqual(expected)
    }
  )
})
