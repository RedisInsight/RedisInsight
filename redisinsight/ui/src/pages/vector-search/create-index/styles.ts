import styled, { css } from 'styled-components'
import { useTheme } from '@redis-ui/styles'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const CreateIndexWrapper = styled(FlexGroup)`
  ${() => css`
    margin-top: ${useTheme().core.space.space250};
    margin-bottom: ${useTheme().core.space.space250};
    background-color: ${useTheme().semantic.color.background.neutral100};
  `}

  width: 95%;
  margin-left: auto;
  margin-right: auto;
`

export const CreateIndexHeader = styled(FlexItem)`
  ${() => css`
    padding: ${useTheme().core.space.space300};
    border-color: ${useTheme().color.dusk200};
  `}

  justify-content: space-between;
  border: 1px solid;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

export const CreateIndexContent = styled(FlexItem)`
  ${() => css`
    gap: ${useTheme().core.space.space550};
    padding: ${useTheme().core.space.space300};
    border-color: ${useTheme().color.dusk200};
  `}

  border-left: 1px solid;
  border-right: 1px solid;
`

export const CreateIndexFooter = styled(FlexItem)`
  ${() => css`
    padding: ${useTheme().core.space.space300};
    border-color: ${useTheme().color.dusk200};
  `}

  border: 1px solid;
  justify-content: space-between;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`
