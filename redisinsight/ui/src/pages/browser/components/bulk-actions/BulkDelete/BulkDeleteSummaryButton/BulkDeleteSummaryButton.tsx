import React, { useEffect, useMemo } from 'react'
import { EuiButton } from '@elastic/eui'
import { Maybe } from 'uiSrc/utils'
import { RedisString } from 'apiSrc/common/constants'

export interface BulkDeleteSummaryButtonProps {
  pattern: string
  deletedKeys: Maybe<RedisString[]>
  keysType: string
  children: React.ReactNode
}

const getFileName = () => `bulk-delete-report-${Date.now()}.txt`

const BulkDeleteSummaryButton = ({
  pattern,
  deletedKeys,
  keysType,
  ...rest
}: BulkDeleteSummaryButtonProps) => {
  const fileUrl = useMemo(() => {
    const content =
      `Pattern: ${pattern}\n` +
      `Key type: ${keysType}\n\n` +
      `Keys:\n\n` +
      `${deletedKeys?.map((key) => Buffer.from(key).toString()).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }, [deletedKeys, pattern, keysType])

  useEffect(
    () => () => {
      URL.revokeObjectURL(fileUrl)
    },
    [fileUrl],
  )

  return (
    <EuiButton
      size="s"
      download={getFileName()}
      color="secondary"
      iconType="download"
      iconSide="left"
      href={fileUrl}
      data-testid="download-bulk-delete-report"
      {...rest}
    />
  )
}

export default BulkDeleteSummaryButton
