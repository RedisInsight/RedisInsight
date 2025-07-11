import styled from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const CreateIndexWrapper = styled(FlexGroup)`
  width: 95%;
  background-color: white;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
`

export const CreateIndexHeader = styled(FlexItem)`
  justify-content: space-between;
  padding: 24px;
  border: 1px solid #b9c2c6;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

export const CreateIndexContent = styled(FlexItem)`
  gap: 44px;
  padding: 24px;
  border-left: 1px solid #b9c2c6;
  border-right: 1px solid #b9c2c6;
`

export const CreateIndexFooter = styled(FlexItem)`
  padding: 24px;
  border: 1px solid #b9c2c6;
  justify-content: space-between;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`
