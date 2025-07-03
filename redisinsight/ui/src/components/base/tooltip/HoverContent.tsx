import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text'

interface RiTooltipContentProps {
  title?: React.ReactNode
  content: React.ReactNode
}

export const HoverContent = ({ title, content }: RiTooltipContentProps) => (
  <Col>
    {title && <Title size="S">{title}</Title>}
    {content}
  </Col>
)
