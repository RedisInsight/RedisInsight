import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { IRecommendationContent } from 'uiSrc/slices/interfaces/recommendations'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import {
  sortRecommendations,
  replaceVariables,
  renderRecommendationBadgesLegend,
  renderRecommendationBadges,
  renderRecommendationContent,
} from '../../recommendation/utils'

const mockTelemetryName = 'name'

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
    ],
    expected: [
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
    ],
    expected: [
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

const mockContent: IRecommendationContent[] = [
  {
    type: 'paragraph',
    value: 'paragraph',
  },
  {
    type: 'span',
    value: 'span',
  },
  {
    type: 'code',
    value: 'code',
  },
  {
    type: 'spacer',
    value: 'l',
  },
  {
    type: 'list',
    value: [[{ id: 'list-1', type: 'span', value: 'list-1' }]],
  },
  {
    type: 'unknown',
    value: 'unknown',
  },
  {
    type: 'link',
    value: 'link',
  },
  {
    type: 'code-link',
    value: 'link',
  },
  {
    type: 'link-sso',
    value: 'link-sso',
  },
]

describe('renderRecommendationBadgesLegend', () => {
  const renderedBadgesLegend = renderRecommendationBadgesLegend()
  render(renderedBadgesLegend)

  expect(screen.queryByTestId('badges-legend')).toBeInTheDocument()
})

describe('sortRecommendations', () => {
  test.each(sortRecommendationsTests)(
    '%j',
    ({ input, expected }) => {
      const result = sortRecommendations(input, MOCK_RECOMMENDATIONS)
      expect(result).toEqual(expected)
    }
  )
})

describe('renderRecommendationBadges', () => {
  it('should render "code_changes" badge', () => {
    const renderedBadges = renderRecommendationBadges(['code_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
  })

  it('should render "configuration_changes" badge', () => {
    const renderedBadges = renderRecommendationBadges(['configuration_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
  })

  it('should render "code_changes" badge', () => {
    const renderedBadges = renderRecommendationBadges(['code_changes'])
    render(renderedBadges)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
  })

  it('should render "upgrade" badge', () => {
    const renderedBadges = renderRecommendationBadges(['upgrade'])
    render(renderedBadges)

    expect(screen.queryByTestId('upgrade')).toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
  })

  it('should render all badges', () => {
    const renderedBadges = renderRecommendationBadges(['upgrade', 'configuration_changes', 'code_changes'])
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

describe('renderRecommendationContent', () => {
  it('should render content', () => {
    const renderedContent = renderRecommendationContent(mockContent, undefined, { telemetryName: mockTelemetryName })
    render(renderedContent)

    expect(screen.queryByTestId(`paragraph-${mockTelemetryName}-0`)).toBeInTheDocument()
    expect(screen.queryByTestId(`span-${mockTelemetryName}-1`)).toBeInTheDocument()
    expect(screen.queryByTestId(`code-${mockTelemetryName}-2`)).toBeInTheDocument()
    expect(screen.queryByTestId(`spacer-${mockTelemetryName}-3`)).toBeInTheDocument()
    expect(screen.queryByTestId(`list-${mockTelemetryName}-4`)).toBeInTheDocument()
    expect(screen.queryByTestId(`link-${mockTelemetryName}-6`)).toBeInTheDocument()
    expect(screen.queryByTestId(`code-link-${mockTelemetryName}-7`)).toBeInTheDocument()
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('click on link should call onClick', () => {
    const onClickMock = jest.fn()
    const renderedContent = renderRecommendationContent(
      mockContent,
      null,
      { telemetryName: mockTelemetryName, onClickLink: onClickMock },
    )
    const { queryByTestId } = render(renderedContent)

    fireEvent.click(queryByTestId(`link-${mockTelemetryName}-6`))

    expect(onClickMock).toBeCalled()
  })
})
