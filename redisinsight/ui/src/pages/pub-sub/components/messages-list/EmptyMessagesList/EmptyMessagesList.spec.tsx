import React from 'react'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { render } from 'uiSrc/utils/test-utils'

import EmptyMessagesList from './EmptyMessagesList'

describe('EmptyMessagesList', () => {
  it('should render', () => {
    expect(
      render(<EmptyMessagesList isSpublishNotSupported />)
    ).toBeTruthy()
  })

  it('should render cluster info for Cluster connection type', () => {
    const { queryByTestId } = render(
      <EmptyMessagesList connectionType={ConnectionType.Cluster} isSpublishNotSupported />
    )

    expect(queryByTestId('empty-messages-list-cluster')).toBeInTheDocument()
  })

  it(' not render cluster info for Cluster connection type', () => {
    const { queryByTestId } = render(
      <EmptyMessagesList connectionType={ConnectionType.Cluster} isSpublishNotSupported={false} />
    )

    expect(queryByTestId('empty-messages-list-cluster')).not.toBeInTheDocument()
  })

  it('should not render cluster info for Cluster connection type', () => {
    const { queryByTestId } = render(
      <EmptyMessagesList connectionType={ConnectionType.Standalone} isSpublishNotSupported />
    )

    expect(queryByTestId('empty-messages-list-cluster')).not.toBeInTheDocument()
  })
})
