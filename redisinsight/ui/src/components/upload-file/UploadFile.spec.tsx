import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import UploadFile, { Props } from './UploadFile'

const mockedProps = mock<Props>()

describe('UploadFile', () => {
  it('should render', () => {
    expect(
      render(<UploadFile {...instance(mockedProps)} />)
    ).toBeTruthy()
  })
})
