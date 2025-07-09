import React from 'react'
import { BoxSelectionGroup, BoxSelectionGroupBox } from '@redis-ui/components'
import styled from 'styled-components'
import { Text, Title } from 'uiSrc/components/base/text'

export interface BoxSelectionOption<T extends string = string>
  extends BoxSelectionGroupBox<T> {
  text?: string
}

const StyledBoxContent = styled.div`
  padding: 16px;
  text-align: left;
`

const StyledTitle = styled(Title)`
  margin-top: 4px;
`

const StyledText = styled(Text)`
  margin-top: 4px;
`

const StyledDisabledBar = styled.div`
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

const SelectionBox = ({ label, text, disabled, ...rest }: any) => (
  <BoxSelectionGroup.Item.Compose {...rest}>
    {disabled && (
      <StyledDisabledBar>
        <Text size="xs">Coming soon</Text>
      </StyledDisabledBar>
    )}
    <StyledBoxContent>
      <BoxSelectionGroup.Item.Icon color="neutral700" customSize="32px" />

      <StyledTitle size="S">{label}</StyledTitle>
      {text && <StyledText size="M">{text}</StyledText>}
    </StyledBoxContent>
  </BoxSelectionGroup.Item.Compose>
)

export default SelectionBox
