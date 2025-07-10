import React from 'react'
import { BoxSelectionGroup, BoxSelectionGroupBox } from '@redis-ui/components'
import {
  DisabledBar,
  StyledBoxContent,
  StyledText,
  StyledTitle,
} from './SelectionBox.styles'

export interface BoxSelectionOption<T extends string = string>
  extends BoxSelectionGroupBox<T> {
  text?: string
}

const SelectionBox = ({ label, text, disabled, ...rest }: any) => (
  <BoxSelectionGroup.Item.Compose {...rest}>
    {disabled && <DisabledBar />}

    <StyledBoxContent>
      <BoxSelectionGroup.Item.Icon color="neutral700" customSize="32px" />

      <StyledTitle size="S">{label}</StyledTitle>
      {text && <StyledText size="M">{text}</StyledText>}
    </StyledBoxContent>
  </BoxSelectionGroup.Item.Compose>
)

export default SelectionBox
