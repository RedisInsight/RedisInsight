import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import RdiPipelineManagementTemplate from './RdiPipelineManagementTemplate'

const child = <div />

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      jobs: [
        { name: 'job1', value: 'value' }
      ]
    },
    setFieldValue: jest.fn()
  })
}))

describe('RdiPipelineManagementTemplate', () => {
  it('should render', () => {
    expect(render(<RdiPipelineManagementTemplate>{child}</RdiPipelineManagementTemplate>)).toBeTruthy()
  })
})
