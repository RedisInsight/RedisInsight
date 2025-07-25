import { TextButton } from '@redis-ui/components'
import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const StyledHeaderAction = styled(FlexGroup)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

export const StyledTextButton = styled(TextButton)`
  color: ${({ theme }) => theme.color.blue400};
  &:hover {
    color: ${({ theme }) => theme.color.blue500};
  }
`
