import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import QueryCardCliDefaultResult, { MAX_CARD_HEIGHT, MIN_ROWS_COUNT, Props } from './QueryCardCliDefaultResult'

const mockedProps = mock<Props>()

describe('QueryCardCliDefaultResult', () => {
  it('should render', () => {
    expect(render(<QueryCardCliDefaultResult {...instance(mockedProps)} />)).toBeTruthy()
  })

  it(`container min-height should be ${MAX_CARD_HEIGHT} if items.length > ${MIN_ROWS_COUNT}`, () => {
    const mockResult: string[] = Array.from({ length: MIN_ROWS_COUNT + 1 }).fill('123')

    const { queryByTestId } = render(
      <QueryCardCliDefaultResult {...instance(mockedProps)} items={mockResult} />
    )

    const resultEl = queryByTestId('query-cli-card-result')

    expect(resultEl).toHaveStyle(`min-height: ${MAX_CARD_HEIGHT}px`)
    expect(resultEl).toHaveTextContent(mockResult.join(''))
  })

  it(
    `container min-height should be calculated  and less than ${MAX_CARD_HEIGHT} if items.length < ${MIN_ROWS_COUNT} `,
    () => {
      const mockResult: string[] = Array.from({ length: 5 }).fill('123')

      const { queryByTestId } = render(
        <QueryCardCliDefaultResult {...instance(mockedProps)} items={mockResult} />
      )

      const resultEl = queryByTestId('query-cli-card-result')

      expect(resultEl).not.toHaveStyle(`min-height: ${MAX_CARD_HEIGHT}px`)
      expect(resultEl).toHaveStyle('min-height: 90px')
      expect(resultEl).toHaveTextContent(mockResult.join(''))
    }
  )
})
