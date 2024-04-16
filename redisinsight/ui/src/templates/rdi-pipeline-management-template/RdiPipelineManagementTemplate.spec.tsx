import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import RdiPipelinePageTemplate from './RdiPipelineManagementTemplate'

const child = <div />

describe('RdiPipelinePageTemplate', () => {
  it('should render', () => {
    expect(render(<RdiPipelinePageTemplate>{child}</RdiPipelinePageTemplate>)).toBeTruthy()
  })
})
