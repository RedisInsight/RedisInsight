import React, { useEffect, useMemo } from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTextColor,
} from '@elastic/eui'

export interface Props {
  message: string
  // eslint-disable-next-line react/no-unused-prop-types
  onClose?: () => void
}

const RdiDeployErrorContent = (props: Props) => {
  const { message } = props

  const fileUrl = useMemo(() => {
    const blob = new Blob([message], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }, [message])

  useEffect(
    () => () => {
      URL.revokeObjectURL(fileUrl)
    },
    [fileUrl],
  )

  return (
    <>
      <EuiTextColor color="ghost">
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            Review the error log for details.
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              size="s"
              color="warning"
              download="error-log.txt"
              href={fileUrl}
              className="toast-danger-btn"
              data-testid="donwload-log-file-btn"
            >
              Download Error Log File
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiTextColor>

      <EuiSpacer />
      {/* // TODO remove display none when logs column will be available */}
      <EuiFlexGroup style={{ display: 'none' }} justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            size="s"
            color="warning"
            onClick={() => {}}
            className="toast-danger-btn"
            data-testid="see-errors-btn"
          >
            Remove API key
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )
}

export default RdiDeployErrorContent
