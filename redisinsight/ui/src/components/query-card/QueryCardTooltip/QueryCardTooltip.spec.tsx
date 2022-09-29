import React from 'react'
import { instance, mock } from 'ts-mockito'
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
})
