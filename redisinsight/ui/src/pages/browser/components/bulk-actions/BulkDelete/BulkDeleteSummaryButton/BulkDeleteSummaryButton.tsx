import React, { useEffect, useMemo } from 'react'
import { EuiButton, EuiFlexItem } from '@elastic/eui'
import { Maybe } from 'uiSrc/utils'

export interface BulkDeleteSummaryButtonProps {
  pattern: string
  deletedKeys: Maybe<any[]>
}

const getFileName = () => `bulk-delete-report-${Date.now()}.txt`

const BulkDeleteSummaryButton = ({
  pattern,
  deletedKeys,
}: BulkDeleteSummaryButtonProps) => {
  const fileUrl = useMemo(() => {
    const content = `Pattern: ${pattern}\n\nKeys:\n\n${deletedKeys?.map((key) => Buffer.from(key).toString()).join('\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }, [deletedKeys])

  useEffect(
    () => () => {
      URL.revokeObjectURL(fileUrl)
    },
    [fileUrl],
  )

  return (
    <EuiFlexItem grow={false}>
      <EuiButton
        fill
        download={getFileName()}
        href={fileUrl}
        data-testid="donwload-bulk-delete-report"
      >
        Download Bulk Delete Report
      </EuiButton>
    </EuiFlexItem>
  )
}

export default BulkDeleteSummaryButton
