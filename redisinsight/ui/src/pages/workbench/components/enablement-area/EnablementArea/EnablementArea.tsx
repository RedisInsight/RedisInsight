import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import cx from 'classnames'
import { EuiListGroup, EuiLoadingContent } from '@elastic/eui'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { EnablementAreaProvider, IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { appContextWorkbenchEA, resetWorkbenchEAItem } from 'uiSrc/slices/app/context'
import { ApiEndpoints } from 'uiSrc/constants'
import { getWBSourcePath } from './utils/getFileInfo'
import {
  CodeButton,
  Group,
  InternalLink,
  LazyCodeButton,
  LazyInternalPage,
  PlainText,
} from './components'

import styles from './styles.module.scss'

const padding = parseInt(styles.paddingHorizontal)

export interface Props {
  guides: Record<string, IEnablementAreaItem>
  tutorials: Record<string, IEnablementAreaItem>
  loading: boolean
  openScript: (
    script: string,
    execute?: { mode?: ExecuteButtonMode, params?: CodeButtonParams },
    file?: { path?: string, name?: string }
  ) => void
  onOpenInternalPage: (page: IInternalPage) => void
  isCodeBtnDisabled?: boolean
}

const EnablementArea = (props: Props) => {
  const {
    guides = {},
    tutorials = {},
    openScript,
    loading,
    onOpenInternalPage,
    isCodeBtnDisabled,
  } = props
  const { search } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()
  const { itemPath: itemFromContext } = useSelector(appContextWorkbenchEA)
  const [isInternalPageVisible, setIsInternalPageVisible] = useState(false)
  const [internalPage, setInternalPage] = useState<IInternalPage>({ path: '' })

  useEffect(() => {
    const pagePath = new URLSearchParams(search).get('item')
    if (pagePath) {
      setIsInternalPageVisible(true)
      setInternalPage({ path: pagePath })
      return
    }
    if (itemFromContext) {
      handleOpenInternalPage({ path: itemFromContext })
      return
    }
    setIsInternalPageVisible(false)
  }, [search])

  const handleOpenInternalPage = (page: IInternalPage) => {
    history.push({
      search: `?item=${page.path}`
    })
    onOpenInternalPage(page)
  }

  const handleCloseInternalPage = () => {
    dispatch(resetWorkbenchEAItem())
    history.push({
      // TODO: better to use query-string parser and update only one parameter (instead of replacing all)
      search: ''
    })
  }

  const renderSwitch = (item: IEnablementAreaItem, sourcePath: string, level: number) => {
    const { label, type, children, id, args } = item
    const paddingsStyle = { paddingLeft: `${padding + level * 8}px`, paddingRight: `${padding}px` }
    const borderStyle = { border: 'none', borderTop: '1px solid var(--separatorColor)' }
    switch (type) {
      case EnablementAreaComponent.Group:
        return (
          <Group triggerStyle={paddingsStyle} testId={id} label={label} {...args}>
            {renderTreeView(Object.values(children || {}) || [], sourcePath, level + 1)}
          </Group>
        )
      case EnablementAreaComponent.CodeButton:
        return (
          <>
            <div style={paddingsStyle} className="divider"><hr style={borderStyle} /></div>
            <div style={{ marginTop: '18px', ...paddingsStyle }}>
              {args?.path
                ? <LazyCodeButton label={label} {...args} />
                : <CodeButton onClick={() => openScript(args?.content || '')} label={label} {...args} />}
            </div>
          </>

        )
      case EnablementAreaComponent.InternalLink:
        return (
          <InternalLink sourcePath={sourcePath} style={paddingsStyle} testId={id || label} label={label} {...args}>
            {args?.content || label}
          </InternalLink>
        )
      default:
        return <PlainText style={paddingsStyle}>{label}</PlainText>
    }
  }

  const renderTreeView = (elements: IEnablementAreaItem[], sourcePath: string, level: number = 0) => (
    elements?.map((item) => (
      <div className="fluid" key={item.id}>
        {renderSwitch(item, sourcePath, level)}
      </div>
    )))

  return (
    <EnablementAreaProvider value={{ setScript: openScript, openPage: handleOpenInternalPage, isCodeBtnDisabled }}>
      <div data-testid="enablementArea" className={cx(styles.container, 'relative', 'enablement-area')}>
        { loading
          ? (
            <div data-testid="enablementArea-loader" className={cx(styles.innerContainer, styles.innerContainerLoader)}>
              <EuiLoadingContent lines={3} />
            </div>
          )
          : (
            <EuiListGroup
              maxWidth="false"
              data-testid="enablementArea-treeView"
              flush
              className={cx(styles.innerContainer)}
            >
              {renderTreeView(Object.values(guides), ApiEndpoints.GUIDES_PATH)}
              {renderTreeView(Object.values(tutorials), ApiEndpoints.TUTORIALS_PATH)}
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
              sourcePath={getWBSourcePath(internalPage?.path)}
            />
          )}
        </div>
      </div>
    </EnablementAreaProvider>
  )
}

export default EnablementArea
