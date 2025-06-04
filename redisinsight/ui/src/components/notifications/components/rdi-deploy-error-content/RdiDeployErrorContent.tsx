import React, { useEffect, useMemo } from 'react'
import { EuiTextColor } from '@elastic/eui'
import { Link } from 'uiSrc/components/base/link/Link'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  EmptyButton,
} from 'uiSrc/components/base/forms/buttons'

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
      <EuiTextColor color="danger">
        <Col>
          <FlexItem>Review the error log for details.</FlexItem>
          <FlexItem>
            <EmptyButton
              size="small"
              variant="destructive"
              className="toast-danger-btn"
            >
              <Link
                variant="small"
                isExternalLink
                href={fileUrl}
                download="error-log.txt"
                data-testid="donwload-log-file-btn"
              >
                Download Error Log File
              </Link>
            </EmptyButton>
          </FlexItem>
        </Col>
      </EuiTextColor>

      <Spacer />
      {/* // TODO remove display none when logs column will be available */}
      <Row style={{ display: 'none' }} justify="end">
        <FlexItem>
          <DestructiveButton
            size="s"
            onClick={() => {}}
            className="toast-danger-btn"
            data-testid="see-errors-btn"
          >
            Remove API key
          </DestructiveButton>
        </FlexItem>
      </Row>
    </>
  )
}

export default RdiDeployErrorContent
