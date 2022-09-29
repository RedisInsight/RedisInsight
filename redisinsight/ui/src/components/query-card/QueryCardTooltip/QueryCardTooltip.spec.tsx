import React from 'react'
import { instance, mock } from 'ts-mockito'
import { EMPTY_COMMAND } from 'uiSrc/constants'
import { render } from 'uiSrc/utils/test-utils'
import QueryCardTooltip, { Props } from './QueryCardTooltip'

const mockedProps = mock<Props>()

/**
 * QueryCardTooltip tests
 *
 * @group unit
 */
describe('QueryCardTooltip', () => {
  it('should render', () => {
    expect(render(<QueryCardTooltip {...instance(mockedProps)} />)).toBeTruthy()
  })

  it(`should show ${EMPTY_COMMAND} if command=null and summary=`, () => {
    const { queryByTestId } = render(
      <QueryCardTooltip {...instance(mockedProps)} query={null} summary={null} />
    )

    expect(queryByTestId('query-card-tooltip-anchor')).toHaveTextContent(EMPTY_COMMAND)
  })
})
