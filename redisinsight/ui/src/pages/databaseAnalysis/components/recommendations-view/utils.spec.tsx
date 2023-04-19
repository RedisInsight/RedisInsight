import { render, screen } from 'uiSrc/utils/test-utils'
import {
  sortRecommendations,
  replaceVariables,
  renderBadgesLegend,
  renderBadges,
  renderContent,
  IContentElement,
} from './utils'

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
      { name: 'searchString' },
    ],
    expected: [
      { name: 'searchString' },
      { name: 'searchIndexes' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ]
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchJSON' },
      { name: 'searchString' },
    ],
    expected: [
      { name: 'searchString' },
      { name: 'searchJSON' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ]
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
      { name: 'searchJSON' },
      { name: 'useSmallerKeys' },
      { name: 'RTS' },
    ],
    expected: [
      { name: 'searchJSON' },
      { name: 'searchIndexes' },
      { name: 'RTS' },
      { name: 'bigSets' },
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

const mockContent: IContentElement[] = [
  {
    id: '1',
    type: 'paragraph',
    value: 'paragraph',
  },
  {
    id: '2',
    type: 'span',
    value: 'span',
  },
  {
    id: '3',
    type: 'pre',
    value: 'pre',
  },
  {
    id: '4',
    type: 'spacer',
    value: 'l',
  },
  {
    id: '5',
    type: 'list',
    value: [[{ id: 'list-1', type: 'span', value: 'list-1' }]],
  },
  {
    id: '6',
    type: 'unknown',
    value: 'unknown',
  },
  {
    id: '7',
    type: 'link',
    value: 'link',
  },
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

describe('renderContent', () => {
  it('should render content', () => {
    const renderedContent = renderContent(mockContent, undefined)
    render(renderedContent)

    expect(screen.queryByTestId('paragraph-1')).toBeInTheDocument()
    expect(screen.queryByTestId('span-2')).toBeInTheDocument()
    expect(screen.queryByTestId('pre-3')).toBeInTheDocument()
    expect(screen.queryByTestId('spacer-4')).toBeInTheDocument()
    expect(screen.queryByTestId('list-5')).toBeInTheDocument()
    expect(screen.queryByTestId('read-more-link')).toBeInTheDocument()
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
