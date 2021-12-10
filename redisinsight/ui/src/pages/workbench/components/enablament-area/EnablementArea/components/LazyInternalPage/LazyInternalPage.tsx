import React, { useEffect, useState } from 'react'
import { startCase } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import {
  setWorkbenchEAGuide,
  resetWorkbenchEAGuide,
  appContextWorkbenchEA,
  setWorkbenchEAGuideScrollTop
} from 'uiSrc/slices/app/context'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { workbenchEnablementAreaSelector } from 'uiSrc/slices/workbench/wb-enablement-area'

import { getFileInfo, getPagesInsideGroup, IFileInfo } from '../../utils/getFileInfo'
import FormatSelector from '../../utils/formatter/FormatSelector'
import InternalPage from '../InternalPage'

interface IPageData extends IFileInfo {
  content: string;
  relatedPages?: IEnablementAreaItem[];
}
const DEFAULT_PAGE_DATA = { content: '', name: '', parent: '', extension: '', location: '', relatedPages: [] }

export interface Props {
  onClose: () => void;
  title?: string;
  path: string;
}

const LazyInternalPage = ({ onClose, title, path }: Props) => {
  const { guideScrollTop } = useSelector(appContextWorkbenchEA)
  const enablementArea = useSelector(workbenchEnablementAreaSelector)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [pageData, setPageData] = useState<IPageData>(DEFAULT_PAGE_DATA)
  const dispatch = useDispatch()
  const fetchService = IS_ABSOLUTE_PATH.test(path) ? axios : resourcesService

  const loadContent = async () => {
    setLoading(true)
    setError('')
    const pageInfo = getFileInfo(path)
    const formatter = FormatSelector.selectFor(pageInfo.extension)
    const relatedPages = getPagesInsideGroup(enablementArea.items, pageInfo.location)
    setPageData({ ...DEFAULT_PAGE_DATA, ...pageInfo, relatedPages })
    try {
      const { data, status } = await fetchService.get<string>(path)
      if (isStatusSuccessful(status)) {
        dispatch(setWorkbenchEAGuide(path))
        const contentData = await formatter.format(data)
        setPageData((prevState) => ({ ...prevState, content: contentData }))
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      const errorMessage: string = getApiErrorMessage(error)
      dispatch(resetWorkbenchEAGuide())
      setError(errorMessage)
    }
  }

  useEffect(() => {
    (async function () {
      if (!enablementArea.loading) {
        await loadContent()
      }
    }())
  }, [path, enablementArea.loading])

  const handlePageScroll = (top: number) => {
    dispatch(setWorkbenchEAGuideScrollTop(top))
  }

  return (
    <InternalPage
      id={pageData.name}
      path={path}
      onClose={onClose}
      title={startCase(title || pageData.name)}
      backTitle={startCase(pageData?.parent)}
      isLoading={isLoading || enablementArea.loading}
      content={pageData.content}
      error={error}
      onScroll={handlePageScroll}
      scrollTop={guideScrollTop}
      pagination={pageData.relatedPages}
    />
  )
}

export default LazyInternalPage
