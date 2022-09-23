import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import EmptyAnalysisMessage, { Props } from './EmptyAnalysisMessage'

const mockedProps = mock<Props>()

describe('Skeleton', () => {
  it('should render', () => {
    expect(render(<EmptyAnalysisMessage {...instance(mockedProps)} />)).toBeTruthy()
  })
})
