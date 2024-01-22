import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import RdiDeployErrorContent, { Props } from './RdiDeployErrorContent'

const mockedProps = mock<Props>()

describe('RdiDeployErrorContent', () => {
  it('should render', () => {
    expect(render(<RdiDeployErrorContent {...instance(mockedProps)} />)).toBeTruthy()
  })
})
