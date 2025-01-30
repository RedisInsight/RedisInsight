import React from 'react'
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTextColor,
} from '@elastic/eui'
import useTextFileDownload from './helpers/useTextFileGenerator'

export interface Props {
  message: string
  onClose?: () => void
}

const RdiDeployErrorContent = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { message, onClose } = props
  const { textToDownloadableFile } = useTextFileDownload()
  const downloadFile = textToDownloadableFile(message, 'log.txt')

  return (
    <>
      <EuiTextColor color="ghost">
        <EuiFlexGroup
          direction="column"
        >
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
