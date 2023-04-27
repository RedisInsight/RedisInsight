import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import BulkDelete, { Props } from './BulkDelete'

const mockedProps = {
  ...mock<Props>(),
}

describe('BulkDelete', () => {
  it('should render', () => {
    expect(render(<BulkDelete {...mockedProps} />)).toBeTruthy()
  })
})
