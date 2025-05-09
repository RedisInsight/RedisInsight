import React, { useEffect, useMemo } from 'react'
import { EuiButton, EuiTextColor } from '@elastic/eui'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

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
        <Col>
          <FlexItem>Review the error log for details.</FlexItem>
          <FlexItem>
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
          </FlexItem>
        </Col>
      </EuiTextColor>

      <Spacer />
      {/* // TODO remove display none when logs column will be available */}
      <Row style={{ display: 'none' }} justify="end">
        <FlexItem>
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
        </FlexItem>
      </Row>
    </>
  )
}

export default RdiDeployErrorContent
