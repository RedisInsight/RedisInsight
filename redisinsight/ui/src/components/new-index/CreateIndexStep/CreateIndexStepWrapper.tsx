import React, { useState } from 'react'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { UsePresetIndex } from './UsePresetIndex'
import { BuildNewIndex } from './BuildNewIndex'

enum VectorIndexTab {
  BuildNewIndex = 'build-new-index',
  UsePresetIndex = 'use-preset-index',
}

const VECTOR_INDEX_TABS: TabInfo<string>[] = [
  {
    value: VectorIndexTab.BuildNewIndex,
    label: <BuildNewIndex.TabBarTrigger />,
    content: null,
    disabled: true,
  },
  {
    value: VectorIndexTab.UsePresetIndex,
    label: <UsePresetIndex.TabBarTrigger />,
    content: <UsePresetIndex.TabContentPane />,
  },
]

export const CreateIndexStepWrapper = () => {
  // TODO: Link it with the parent context defined by the wizard, so we can keep the selected tab state
  const [activeTab, setActiveTab] = useState<VectorIndexTab>(
    VectorIndexTab.UsePresetIndex,
  )

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue as VectorIndexTab)
  }

  return (
    <Tabs
      defaultValue={activeTab}
      tabs={VECTOR_INDEX_TABS}
      onChange={handleTabChange}
      variant="sub"
    />
  )
}
