import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import cx from 'classnames'
import { EuiListGroup, EuiLoadingContent } from '@elastic/eui'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { EnablementAreaProvider, IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { appContextWorkbenchEA, resetWorkbenchEAGuide } from 'uiSrc/slices/app/context'
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
  items: Record<string, IEnablementAreaItem>;
  loading: boolean;
  openScript: (script: string, path: string) => void;
  openInternalPage: (page: IInternalPage) => void;
}

const EnablementArea = ({ items, openScript, loading }: Props) => {
  const { search } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()
  const { guidePath: guideFromContext } = useSelector(appContextWorkbenchEA)
  const [isInternalPageVisible, setIsInternalPageVisible] = useState(false)
  const [internalPage, setInternalPage] = useState<IInternalPage>({ path: '' })

  useEffect(() => {
    const pagePath = new URLSearchParams(search).get('guide')
    if (pagePath) {
      setIsInternalPageVisible(true)
      setInternalPage({ path: pagePath })
      return
    }
    if (guideFromContext) {
      handleOpenInternalPage({ path: guideFromContext })
      return
    }
    setIsInternalPageVisible(false)
  }, [search])

  const handleOpenInternalPage = (page: IInternalPage) => {
    history.push({
      search: `?guide=${page.path}`
    })
  }

  const handleCloseInternalPage = () => {
    dispatch(resetWorkbenchEAGuide())
    history.push({
      // TODO: better to use query-string parser and update only one parameter (instead of replacing all)
      search: ''
    })
  }

  const renderSwitch = (item: IEnablementAreaItem) => {
    const { label, type, children, id, args } = item
    switch (type) {
      case EnablementAreaComponent.Group:
        return (
          <Group
            testId={id}
            label={label}
            {...args}
          >
            {renderTreeView(Object.values(children || {}) || [])}
          </Group>
        )
      case EnablementAreaComponent.CodeButton:
        return args?.path
          ? <div style={{ marginTop: '16px' }}><LazyCodeButton label={label} {...args} /></div>
          : <div style={{ marginTop: '16px' }}><CodeButton onClick={() => openScript(args?.content || '', '')} label={label} {...args} /></div>
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
      <div className="fluid" key={item.id}>
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
              {renderTreeView(Object.values(items))}
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
