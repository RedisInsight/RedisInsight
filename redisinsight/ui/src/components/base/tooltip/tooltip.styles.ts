import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const TitleWrapper = styled(Text).attrs({
  size: 'm',
})`
  font-weight: bold;
`
