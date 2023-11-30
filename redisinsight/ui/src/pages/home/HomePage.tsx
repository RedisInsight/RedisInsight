import { EuiPage, EuiPageBody, EuiResizeObserver, EuiTab, EuiTabs } from '@elastic/eui'
import React, { useMemo, useState } from 'react'
import { PageHeader } from 'uiSrc/components'
import Databases from './components/databases/Databases'
import Rdi from './components/rdi/Rdi'

import './styles.scss'
import styles from './styles.module.scss'

const HomePage = () => {
  const [width, setWidth] = useState(0)

  const onResize = ({ width: innerWidth }: { width: number }) => {
    setWidth(innerWidth)
  }

  const tabs = [
    {
      id: 'databases',
      name: 'Databases',
      content: (resizeRef: (e: HTMLElement | null) => void) => <Databases resizeRef={resizeRef} width={width} />
    },
    {
      id: 'rdi',
      name: 'Integrate',
      content: (resizeRef: (e: HTMLElement | null) => void) => <Rdi resizeRef={resizeRef} width={width} />
    }
  ]

  const [selectedTabId, setSelectedTabId] = useState('databases')
  const selectedTabContent = useMemo(() => tabs.find((obj) => obj.id === selectedTabId)?.content, [selectedTabId])

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id)
  }

  const renderTabs = () =>
    tabs.map((tab) => (
      <EuiTab
        key={tab.id}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
      >
        {tab.name}
      </EuiTab>
    ))

  return (
    <>
      <PageHeader content={<EuiTabs>{renderTabs()}</EuiTabs>} />
      <EuiResizeObserver onResize={onResize}>
        {(resizeRef) => (
          <EuiPage className={styles.page}>
            <EuiPageBody component="div">
              <div ref={resizeRef}>{selectedTabContent && selectedTabContent(resizeRef)}</div>
            </EuiPageBody>
          </EuiPage>
        )}
      </EuiResizeObserver>
    </>
  )
}

export default HomePage
