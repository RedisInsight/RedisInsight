import React from 'react'
import styled from 'styled-components'
import { Badge } from '@redis-ui/components'

const StyledTabBarTrigger = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const TabBarTrigger = () => (
  <StyledTabBarTrigger>
    Build new index <Badge label="Coming soon" />
  </StyledTabBarTrigger>
)
