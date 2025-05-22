import styled, { css } from 'styled-components'

const ActiveStyle = css`
  background-color: var(--euiColorSuccessText) !important;
  transform: none;
  cursor: default;
`
export const NavigationItemWrapper = styled.div<{
  active?: boolean
  children: React.ReactNode
  className?: string
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  color: #bdc3d7 !important;

  & button {
    color: #bdc3d7 !important;
    cursor: default;
  }

  &:hover button {
    transform: translateY(-1px);
    background-color: #34406f !important;
    ${({ active }) => active && ActiveStyle}
  }

  ${({ active }) => active && ActiveStyle}
`
