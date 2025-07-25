import React, { useState } from 'react'
import { StyledHeaderAction, StyledTextButton } from './HeaderActions.styles'
import { ManageIndexesDrawer } from '../manage-indexes/ManageIndexesDrawer'

export const HeaderActions = () => {
  const [isManageIndexesDrawerOpen, setIsManageIndexesDrawerOpen] =
    useState<boolean>(false)

  return (
    <>
      <StyledHeaderAction data-testid="vector-search-header-actions">
        <StyledTextButton>Saved queries</StyledTextButton>
        <StyledTextButton onClick={() => setIsManageIndexesDrawerOpen(true)}>
          Manage indexes
        </StyledTextButton>
      </StyledHeaderAction>

      <ManageIndexesDrawer
        open={isManageIndexesDrawerOpen}
        onOpenChange={setIsManageIndexesDrawerOpen}
      />
    </>
  )
}
