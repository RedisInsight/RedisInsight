import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import EmptyAnalysisMessage, { Props } from './EmptyAnalysisMessage'

const mockedProps = mock<Props>()

/**
 * EmptyAnalysisMessage tests
 *
 * @group unit
 */
describe('EmptyAnalysisMessage', () => {
  it('should render', () => {
    expect(render(<EmptyAnalysisMessage {...instance(mockedProps)} />)).toBeTruthy()
  })
})
