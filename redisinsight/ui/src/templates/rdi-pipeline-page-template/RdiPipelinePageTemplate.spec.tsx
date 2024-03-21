import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import RdiPipelinePageTemplate from './RdiPipelinePageTemplate'

const child = <div />

jest.mock('formik')

describe('RdiPipelinePageTemplate', () => {
  it('should render', () => {
    expect(render(<RdiPipelinePageTemplate>{child}</RdiPipelinePageTemplate>)).toBeTruthy()
  })
})
