import React from 'react'
import { render, screen } from '@testing-library/react'
import BulkDeleteSummaryButton from './BulkDeleteSummaryButton'

const readBlobContent = (blob: Blob) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsText(blob)
  })

describe('BulkDeleteSummaryButton', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'mockFileUrl')
    URL.revokeObjectURL = jest.fn()
  })

  it('should render', () => {
    expect(
      render(
        <BulkDeleteSummaryButton
          pattern="test-pattern"
          deletedKeys={['key1', 'key2']}
        />,
      ),
    ).toBeTruthy()

    expect(
      screen.getByTestId('donwload-bulk-delete-report'),
    ).toBeInTheDocument()
  })

  it('should generate correct file content', async () => {
    render(
      <BulkDeleteSummaryButton
        pattern="test-pattern"
        deletedKeys={['key1', 'key2']}
      />,
    )

    const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)

    const textContent = await readBlobContent(blob)
    expect(textContent).toBe('Pattern: test-pattern\n\nKeys:\n\nkey1\nkey2')
  })

  it('should handle empty deletedKeys array correctly', async () => {
    render(<BulkDeleteSummaryButton pattern="test-pattern" deletedKeys={[]} />)

    const blob = (URL.createObjectURL as jest.Mock).mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)

    const textContent = await readBlobContent(blob)
    expect(textContent).toBe('Pattern: test-pattern\n\nKeys:\n\n')
  })

  it('should clean up the file URL on unmount', () => {
    const { unmount } = render(
      <BulkDeleteSummaryButton pattern="test-pattern" deletedKeys={['key1']} />,
    )

    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mockFileUrl')
  })
})
