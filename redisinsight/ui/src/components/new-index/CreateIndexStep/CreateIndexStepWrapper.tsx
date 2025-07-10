import React from 'react'
import { TabsProps } from '@redis-ui/components'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { BuildNewIndexTabTrigger } from './BuildNewIndex/BuildNewIndexTabTrigger'

export enum VectorIndexTab {
  BuildNewIndex = 'build-new-index',
  UsePresetIndex = 'use-preset-index',
}

const VECTOR_INDEX_TABS: TabInfo<string>[] = [
  {
    value: VectorIndexTab.BuildNewIndex,
    label: <BuildNewIndexTabTrigger />,
    content: null,
    disabled: true,
  },
  {
    value: VectorIndexTab.UsePresetIndex,
    label: 'Use preset index',
    content: <div>TODO: Add content later</div>,
  },
]

export const CreateIndexStepWrapper = (props: Partial<TabsProps>) => {
  const { tabs, defaultValue, ...restProps } = props

  return (
    <Tabs
      tabs={tabs ?? VECTOR_INDEX_TABS}
      defaultValue={defaultValue ?? VectorIndexTab.UsePresetIndex}
      variant="sub"
      {...restProps}
    />
  )
}
