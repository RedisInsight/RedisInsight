import React, { useState } from 'react'
import cx from 'classnames'
import { EuiListGroup, EuiLoadingContent } from '@elastic/eui'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { EnablementAreaProvider, IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import {
  CodeButton,
  Group,
  InternalLink,
  LazyCodeButton,
  LazyInternalPage,
  PlainText
} from './components'

import './styles.scss'
import styles from './styles.module.scss'

export interface Props {
  items: IEnablementAreaItem[];
  loading: boolean;
  openScript: (script: string) => void;
}

const EnablementArea = ({ items, openScript, loading }: Props) => {
  const [isInternalPageVisible, setIsInternalPageVisible] = useState(false)
  const [internalPage, setInternalPage] = useState<IInternalPage>(
    { backTitle: '', path: '', label: '' }
  )

  const handleOpenInternalPage = (page: IInternalPage) => {
    setIsInternalPageVisible(true)
    setInternalPage(page)
  }

  const handleCloseInternalPage = () => {
    setIsInternalPageVisible(false)
  }

  const renderSwitch = (item: IEnablementAreaItem) => {
    const { label, type, children, id, args } = item
    switch (type) {
      case EnablementAreaComponent.Group:
        return <Group testId={id || label} label={label} {...args}>{renderTreeView(children || [])}</Group>
      case EnablementAreaComponent.CodeButton:
        return args?.path
          ? <LazyCodeButton label={label} {...args} />
          : <CodeButton onClick={() => openScript(args?.content || '')} label={label} {...args} />
      case EnablementAreaComponent.InternalLink:
        return (
          <InternalLink testId={id || label} label={label} {...args}>
            {args?.content || label}
          </InternalLink>
        )
      default:
        return <PlainText>{label}</PlainText>
    }
  }

  const renderTreeView = (elements: IEnablementAreaItem[]) => (
    elements?.map((item) => (
      <div className={styles.item} key={item.id}>
        {renderSwitch(item)}
      </div>
    )))

  return (
    <EnablementAreaProvider value={{ setScript: openScript, openPage: handleOpenInternalPage }}>
      <div data-testid="enablementArea" className={cx(styles.container, 'relative', 'enablement-area')}>
        { loading
          ? (
            <div data-testid="enablementArea-loader" className={styles.innerContainer}><EuiLoadingContent lines={3} /></div>
          )
          : (
            <EuiListGroup
              maxWidth="false"
              data-testid="enablementArea-treeView"
              flush
              className={cx(styles.innerContainer)}
            >
              {renderTreeView(items)}
            </EuiListGroup>
          )}
        <div
          className={cx({
            [styles.internalPage]: true,
            [styles.internalPageVisible]: isInternalPageVisible,
          })}
        >
          {internalPage?.path && (
            <LazyInternalPage
              onClose={handleCloseInternalPage}
              backTitle={internalPage.backTitle}
              title={internalPage?.label}
              path={internalPage?.path}
            />
          )}
        </div>
      </div>
    </EnablementAreaProvider>
  )
}

export default EnablementArea
