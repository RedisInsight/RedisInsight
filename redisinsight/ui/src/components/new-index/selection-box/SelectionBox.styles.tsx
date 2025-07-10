import React from 'react'
import styled from 'styled-components'
import { Text, Title } from 'uiSrc/components/base/text'

export const StyledBoxContent = styled.div`
  padding: 16px;
  text-align: left;
`

export const StyledTitle = styled(Title)`
  margin-top: 4px;
`

export const StyledText = styled(Text)`
  margin-top: 4px;
`

export const StyledDisabledBar = styled.div`
  padding: 2px 0;
  /* Design color: #f4f5f6 */
  background: var(--comboBoxBadgeBgColor);
  /* Design color: #5c707a */
  color: var(--badgeIconColor);
  border-radius: 2px;
  border-bottom: 1px solid var(--controlsBoxShadowColor);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

export const DisabledBar = () => (
  <StyledDisabledBar>
    <Text size="xs">Coming soon</Text>
  </StyledDisabledBar>
)
