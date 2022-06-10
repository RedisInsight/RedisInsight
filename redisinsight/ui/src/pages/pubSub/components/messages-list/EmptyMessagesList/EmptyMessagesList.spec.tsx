import React from 'react'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { render } from 'uiSrc/utils/test-utils'

import EmptyMessagesList from './EmptyMessagesList'

describe('EmptyMessagesList', () => {
  it('should render', () => {
    expect(
      render(<EmptyMessagesList />)
    ).toBeTruthy()
  })

  it('should render cluster info for Cluster connection type', () => {
    const { queryByTestId } = render(<EmptyMessagesList connectionType={ConnectionType.Cluster} />)

    expect(queryByTestId('empty-messages-list-cluster')).toBeInTheDocument()
  })
})
