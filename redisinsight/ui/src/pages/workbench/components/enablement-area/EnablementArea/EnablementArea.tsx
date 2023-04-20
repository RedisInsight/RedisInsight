import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import cx from 'classnames'
import { EuiListGroup, EuiLoadingContent } from '@elastic/eui'
import { isArray, isEmpty } from 'lodash'
import { CodeButtonParams, ExecuteButtonMode } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { EnablementAreaComponent, IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { EnablementAreaProvider, IInternalPage } from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { appContextWorkbenchEA, resetWorkbenchEASearch } from 'uiSrc/slices/app/context'
import { ApiEndpoints, EAItemActions, EAManifestFirstKey } from 'uiSrc/constants'
import { deleteCustomTutorial, uploadCustomTutorial } from 'uiSrc/slices/workbench/wb-custom-tutorials'
import { Nullable } from 'uiSrc/utils'
import {
  FormValues
} from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/components/UploadTutorialForm/UploadTutorialForm'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {
  getMarkdownPathByManifest,
  getWBSourcePath
} from './utils/getFileInfo'
import {
  CodeButton,
  Group,
  InternalLink,
  LazyCodeButton,
  LazyInternalPage,
  PlainText,
  UploadTutorialForm,
  WelcomeMyTutorials,
} from './components'

import styles from './styles.module.scss'

const padding = parseInt(styles.paddingHorizontal)

export interface Props {
  guides: IEnablementAreaItem[]
  tutorials: IEnablementAreaItem[]
  customTutorials: IEnablementAreaItem[]
  loading: boolean
  openScript: (
    script: string,
    execute?: { mode?: ExecuteButtonMode, params?: CodeButtonParams },
    file?: { path?: string, name?: string, section?: string }
  ) => void
  onOpenInternalPage: (page: IInternalPage) => void
  isCodeBtnDisabled?: boolean
}

const EnablementArea = (props: Props) => {
  const {
    guides = [],
    tutorials = [],
    customTutorials = [],
    openScript,
    loading,
    onOpenInternalPage,
    isCodeBtnDisabled,
  } = props
  const { search } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()
  const { search: searchEAContext } = useSelector(appContextWorkbenchEA)

  const [isInternalPageVisible, setIsInternalPageVisible] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [internalPage, setInternalPage] = useState<IInternalPage>({ path: '' })
  const [manifest, setManifest] = useState<Nullable<IEnablementAreaItem[]>>(null)

  const searchRef = useRef<string>('')
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  useEffect(() => {
    searchRef.current = search
    const pagePath = new URLSearchParams(search).get('item')

    if (pagePath) {
      setIsInternalPageVisible(true)
      setInternalPage({ path: pagePath })
      return
    }

    const contextPath = new URLSearchParams(searchEAContext).get('item')

    if (contextPath) {
      handleOpenInternalPage({ path: contextPath })
    }

    setIsInternalPageVisible(false)
  }, [search])

  useEffect(() => {
    const manifestPath = new URLSearchParams(search).get('path')
    const contextManifestPath = new URLSearchParams(searchEAContext).get('path')
    const { manifest, prefixFolder } = getManifestByPath(manifestPath)

    if (isEmpty(manifest) && !contextManifestPath) {
      return
    }

    setManifest(manifest)

    const path = getMarkdownPathByManifest(manifest, manifestPath, prefixFolder)
    if (path) {
      setIsInternalPageVisible(true)
      setInternalPage({ path, manifestPath })
      return
    }

    if (contextManifestPath) {
      handleOpenInternalPage({ path: '', manifestPath: contextManifestPath })
      return
    }

    setIsInternalPageVisible(false)
  }, [search, customTutorials, guides, tutorials])

  const getManifestByPath = (path: Nullable<string> = '') => {
    const manifestPath = path?.replace(/^\//, '') || ''
    if (manifestPath.startsWith(EAManifestFirstKey.CUSTOM_TUTORIALS)) {
      return ({ manifest: customTutorials, prefixFolder: ApiEndpoints.CUSTOM_TUTORIALS_PATH })
    }
    if (manifestPath.startsWith(EAManifestFirstKey.TUTORIALS)) {
      return ({ manifest: tutorials, prefixFolder: ApiEndpoints.TUTORIALS_PATH })
    }
    if (manifestPath.startsWith(EAManifestFirstKey.GUIDES)) {
      return ({ manifest: guides, prefixFolder: ApiEndpoints.GUIDES_PATH })
    }

    return { manifest: null }
  }

  const getManifestItems = (manifest: IEnablementAreaItem[]) =>
    (isArray(manifest) ? manifest.map((item, index) => ({ ...item, _key: `${index}` })) : [])

  const handleOpenInternalPage = (page: IInternalPage) => {
    history.push({
      search: page.manifestPath ? `?path=${page.manifestPath}` : `?item=${page.path}`
    })
    onOpenInternalPage(page)
  }

  const handleCloseInternalPage = () => {
    dispatch(resetWorkbenchEASearch())
    history.push({
      // TODO: better to use query-string parser and update only one parameter (instead of replacing all)
      search: ''
    })
  }

  const onDeleteCustomTutorial = (id: string) => {
    dispatch(deleteCustomTutorial(id, () => {
      sendEventTelemetry({
        event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_TUTORIAL_DELETED,
        eventData: {
          databaseId: instanceId,
        }
      })
    }))
  }

  const submitCreate = ({ file, link }: FormValues) => {
    const formData = new FormData()

    if (file) {
      formData.append('file', file)
    } else {
      formData.append('link', link)
    }

    sendEventTelemetry({
      event: TelemetryEvent.WORKBENCH_ENABLEMENT_AREA_IMPORT_SUBMITTED,
      eventData: {
        databaseId: instanceId,
        source: file ? 'Upload' : 'URL'
      }
    })

    dispatch(uploadCustomTutorial(
      formData,
      () => setIsCreateOpen(false),
    ))
  }

  const renderSwitch = (
    item: IEnablementAreaItem,
    { sourcePath, manifestPath = '' }: { sourcePath: string, manifestPath?: string },
    level: number,
  ) => {
    const { label, type, children, id, args, _actions: actions, _path: uriPath, _key: key } = item

    const paddingsStyle = { paddingLeft: `${padding + level * 8}px`, paddingRight: `${padding}px` }
    const currentSourcePath = sourcePath + (uriPath ? `${uriPath}` : (args?.path ?? ''))
    const currentManifestPath = `${manifestPath}/${key}`

    switch (type) {
      case EnablementAreaComponent.Group:
        return (
          <Group
            triggerStyle={paddingsStyle}
            id={id}
            label={label}
            actions={actions}
            isShowActions={currentSourcePath.startsWith(ApiEndpoints.CUSTOM_TUTORIALS_PATH)}
            onCreate={() => setIsCreateOpen((v) => !v)}
            onDelete={onDeleteCustomTutorial}
            isPageOpened={isInternalPageVisible}
            {...args}
          >
            <>
              {level === 0 && actions?.includes(EAItemActions.Create) && (
                <>
                  {isCreateOpen && (
                    <UploadTutorialForm
                      onSubmit={submitCreate}
                      onCancel={() => setIsCreateOpen(false)}
                    />
                  )}
                  {!isCreateOpen && children?.length === 0 && (
                    <WelcomeMyTutorials handleOpenUpload={() => setIsCreateOpen(true)} />
                  )}
                </>
              )}
              {renderTreeView(
                children ? getManifestItems(children) : [],
                { sourcePath: currentSourcePath, manifestPath: currentManifestPath },
                level + 1
              )}
            </>
          </Group>
        )
      case EnablementAreaComponent.CodeButton:
        return (
          <>
            <div style={paddingsStyle} className="divider">
              <hr style={{ border: 'none', borderTop: '1px solid var(--separatorColor)' }} />
            </div>
            <div style={{ marginTop: '10px', marginBottom: '10px', ...paddingsStyle }}>
              {args?.path
                ? <LazyCodeButton label={label} sourcePath={sourcePath} {...args} />
                : <CodeButton onClick={() => openScript(args?.content || '')} label={label} {...args} />}
            </div>
          </>

        )
      case EnablementAreaComponent.InternalLink:
        return (
          <InternalLink
            manifestPath={currentManifestPath}
            sourcePath={currentSourcePath}
            style={paddingsStyle}
            testId={id || label}
            label={label}
            {...args}
          >
            {args?.content || label}
          </InternalLink>
        )
      default:
        return <PlainText style={paddingsStyle}>{label}</PlainText>
    }
  }

  const renderTreeView = (
    elements: IEnablementAreaItem[],
    paths: { sourcePath: string, manifestPath?: string },
    level: number = 0,
  ) => (
    elements?.map((item) => (
      <div className="fluid" key={`${item.id}_${item._key}`}>
        {renderSwitch(item, paths, level)}
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
              {guides && (
                <div className={styles.tutorialWrapper}>
                  {renderTreeView(
                    getManifestItems(guides),
                    { sourcePath: ApiEndpoints.GUIDES_PATH, manifestPath: EAManifestFirstKey.GUIDES }
                  )}
                </div>
              )}
              {tutorials && (
                <div className={styles.tutorialWrapper}>
                  {renderTreeView(
                    getManifestItems(tutorials),
                    { sourcePath: ApiEndpoints.TUTORIALS_PATH, manifestPath: EAManifestFirstKey.TUTORIALS }
                  )}
                </div>
              )}
              {customTutorials && (
                <div className={styles.tutorialWrapper}>
                  {renderTreeView(
                    getManifestItems(customTutorials),
                    {
                      sourcePath: ApiEndpoints.CUSTOM_TUTORIALS_PATH,
                      manifestPath: EAManifestFirstKey.CUSTOM_TUTORIALS
                    }
                  )}
                </div>
              )}
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
              manifest={manifest}
              manifestPath={internalPage?.manifestPath}
              sourcePath={getWBSourcePath(internalPage?.path)}
              search={searchRef.current}
            />
          )}
        </div>
      </div>
    </EnablementAreaProvider>
  )
}

export default EnablementArea
