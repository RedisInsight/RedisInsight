import React from 'react'
import { useFormikContext } from 'formik'

import { render } from 'uiSrc/utils/test-utils'
import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import RdiPipelineManagementTemplate from './RdiPipelineManagementTemplate'

const child = <div />

jest.mock('formik')

describe('RdiPipelineManagementTemplate', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      setFieldValue: jest.fn,
      values: MOCK_RDI_PIPELINE_DATA,
    };
    (useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<RdiPipelineManagementTemplate>{child}</RdiPipelineManagementTemplate>)).toBeTruthy()
  })
})
