import React from 'react'
import { DrawerProps } from '@redis-ui/components'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
} from 'uiSrc/components/base/layout/drawer'

export interface ManageIndexesDrawerProps extends DrawerProps {}

export const ManageIndexesDrawer = ({
  open,
  onOpenChange,
  ...rest
}: ManageIndexesDrawerProps) => (
  <Drawer
    open={open}
    onOpenChange={onOpenChange}
    data-testid="manage-indexes-drawer"
    {...rest}
  >
    <DrawerHeader title="Manage indexes" />
    <DrawerBody data-testid="manage-indexes-drawer-body">
      <p>Manage indexes info will be added later</p>
    </DrawerBody>
  </Drawer>
)
