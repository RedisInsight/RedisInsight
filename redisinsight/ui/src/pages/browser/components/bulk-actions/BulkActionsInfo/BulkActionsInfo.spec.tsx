import React from 'react'
import { mock } from 'ts-mockito'
import { KeyTypes } from 'uiSrc/constants'
import { render, screen } from 'uiSrc/utils/test-utils'

import BulkActionsInfo, { Props } from './BulkActionsInfo'

const mockedProps = {
  ...mock<Props>(),
}

/**
 * BulkActionsInfo tests
 *
 * @group unit
 */
describe('BulkActionsInfo', () => {
  it('should render', () => {
    expect(render(<BulkActionsInfo {...mockedProps} />)).toBeTruthy()
  })

  it('filter should render when exists', () => {
    render(<BulkActionsInfo {...mockedProps} filter={KeyTypes.Hash} />)

    expect(screen.queryByTestId('bulk-actions-info-filter')).toBeInTheDocument()
  })

  it('filter should not render when does not exist', () => {
    render(<BulkActionsInfo {...mockedProps} filter={null} />)

    expect(screen.queryByTestId('bulk-actions-info-filter')).not.toBeInTheDocument()
  })
})
