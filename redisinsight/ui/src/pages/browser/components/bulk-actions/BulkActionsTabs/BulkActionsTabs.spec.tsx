import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import BulkActionsTabs, { Props } from './BulkActionsTabs'

const mockedProps = {
  ...mock<Props>(),
}

/**
 * BulkActionsTabs tests
 *
 * @group unit
 */
describe('BulkActionsTabs', () => {
  it('should render', () => {
    expect(render(<BulkActionsTabs {...mockedProps} />)).toBeTruthy()
  })
})
