import React from 'react'

import { ContentWrapper, TitleWrapper } from './tooltip.styles'

interface RiTooltipContentProps {
  title?: React.ReactNode
  content: React.ReactNode
}

export const HoverContent = ({ title, content }: RiTooltipContentProps) => (
  <ContentWrapper>
    {title && <TitleWrapper>{title}</TitleWrapper>}
    {content}
  </ContentWrapper>
)
