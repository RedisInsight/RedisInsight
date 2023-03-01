import React, { useEffect, useState } from 'react'
import { startCase } from 'lodash'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import { getApiErrorMessage, isStatusSuccessful, Nullable } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import {
  resetWorkbenchEASearch,
  appContextWorkbenchEA,
  setWorkbenchEAItemScrollTop, setWorkbenchEASearch
} from 'uiSrc/slices/app/context'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { workbenchGuidesSelector } from 'uiSrc/slices/workbench/wb-guides'
import { workbenchTutorialsSelector } from 'uiSrc/slices/workbench/wb-tutorials'
import { workbenchCustomTutorialsSelector } from 'uiSrc/slices/workbench/wb-custom-tutorials'

import InternalPage from '../InternalPage'
import { getFileInfo, getPagesInsideGroup, IFileInfo } from '../../utils/getFileInfo'
import FormatSelector from '../../utils/formatter/FormatSelector'

interface IPageData extends IFileInfo {
  content: string
  relatedPages?: IEnablementAreaItem[]
}
const DEFAULT_PAGE_DATA = { content: '', name: '', parent: '', extension: '', location: '', relatedPages: [] }

export interface Props {
  onClose: () => void
  title?: string
  path: string
  manifest: Nullable<IEnablementAreaItem[]>
  manifestPath?: Nullable<string>
  sourcePath: string
  search: string
}

const LazyInternalPage = ({ onClose, title, path, sourcePath, manifest, manifestPath, search }: Props) => {
  const history = useHistory()
  const { itemScrollTop } = useSelector(appContextWorkbenchEA)
  const { loading: guidesLoading } = useSelector(workbenchGuidesSelector)
  const { loading: tutorialsLoading } = useSelector(workbenchTutorialsSelector)
  const { loading: customTutorialsLoading } = useSelector(workbenchCustomTutorialsSelector)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [pageData, setPageData] = useState<IPageData>(DEFAULT_PAGE_DATA)
  const dispatch = useDispatch()
  const fetchService = IS_ABSOLUTE_PATH.test(path) ? axios : resourcesService

  const isMarkdownLoading = isLoading || guidesLoading || tutorialsLoading || customTutorialsLoading
  const getRelatedPages = () => (manifest ? getPagesInsideGroup(manifest, manifestPath) : [])
  const loadContent = async () => {
    setLoading(true)
    setError('')

    const pageInfo = getFileInfo({ manifestPath, path }, manifest)
    const relatedPages = getRelatedPages()
    setPageData({ ...DEFAULT_PAGE_DATA, ...pageInfo, relatedPages })

    try {
      const formatter = FormatSelector.selectFor(pageInfo.extension)
      const { data, status } = await fetchService.get<string>(path)
      if (isStatusSuccessful(status)) {
        dispatch(setWorkbenchEASearch(search))
        const contentData = await formatter.format(data, { history })
        setPageData((prevState) => ({ ...prevState, content: contentData }))
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      const errorMessage: string = getApiErrorMessage(error)
      dispatch(resetWorkbenchEASearch())
      setError(errorMessage)
    }
  }

  useEffect(() => {
    const startLoadContent = async () => {
      await loadContent()
    }
    startLoadContent()
  }, [path, sourcePath])

  const handlePageScroll = (top: number) => {
    dispatch(setWorkbenchEAItemScrollTop(top))
  }

  return (
    <InternalPage
      activeKey={pageData._key}
      path={path}
      manifestPath={manifestPath}
      sourcePath={sourcePath}
      onClose={onClose}
      title={startCase(title || pageData.name)}
      backTitle={startCase(pageData?.parent)}
      isLoading={isMarkdownLoading}
      content={pageData.content}
      error={error}
      onScroll={handlePageScroll}
      scrollTop={itemScrollTop}
      pagination={pageData.relatedPages}
    />
  )
}

export default LazyInternalPage
