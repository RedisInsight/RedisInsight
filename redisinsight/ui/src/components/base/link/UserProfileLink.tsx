import styled from "styled-components"
import { useTheme } from "@redis-ui/styles"
import { Link } from "./Link"

export const UserProfileLink = styled(Link)`
  padding: 8px 12px !important;
  width: 100%;
  color: ${({ theme }: { theme: ReturnType<typeof useTheme> }) =>
    theme.color.azure500} !important;

  &:not(:last-child) {
    border-bottom: 1px solid
      ${({ theme }: { theme: ReturnType<typeof useTheme> }) =>
    theme.color.azure500};
  }

  span {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    text-decoration: none !important;
    cursor: pointer;
  }
`