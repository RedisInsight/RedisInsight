import React from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTextColor,
} from '@elastic/eui'

export interface Props {
  message: string
  onClose?: () => void
}

export const textToDownloadableFile = (text: string, fileName: string = 'log.txt') => {
  const blob = new Blob([text], { type: 'text/plain' })
  const fileUrl = URL.createObjectURL(blob)

  return () => {
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Cleanup after download to avoid memory leaks
    URL.revokeObjectURL(fileUrl)
  }
}

const RdiDeployErrorContent = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { message, onClose } = props
  const downloadFile = textToDownloadableFile(message)

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
              onClick={downloadFile}
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
