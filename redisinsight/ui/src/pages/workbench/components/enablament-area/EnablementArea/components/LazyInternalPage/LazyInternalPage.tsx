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
import { getFileInfo } from '../../utils/getFileInfo'
import InternalPage from '../InternalPage'

export interface Props {
  onClose: () => void;
  title?: string;
  path: string;
}

const LazyInternalPage = ({ onClose, title, path }: Props) => {
  const { guideScrollTop } = useSelector(appContextWorkbenchEA)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const pageInfo = getFileInfo(path)
  const dispatch = useDispatch()
  const fetchService = IS_ABSOLUTE_PATH.test(path) ? axios : resourcesService

  const loadContent = async () => {
    setLoading(true)
    setError('')
    setContent('')
    try {
      const { data, status } = await fetchService.get<string>(path)
      if (isStatusSuccessful(status)) {
        dispatch(setWorkbenchEAGuide(path))
        setLoading(false)
        setContent(data)
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
      await loadContent()
    }())
  }, [path])

  const handlePageScroll = (top: number) => {
    dispatch(setWorkbenchEAGuideScrollTop(top))
  }

  return (
    <InternalPage
      onClose={onClose}
      title={startCase(title || pageInfo.title)}
      backTitle={startCase(pageInfo?.parent)}
      isLoading={isLoading}
      content={content}
      error={error}
      onScroll={handlePageScroll}
      scrollTop={guideScrollTop}
    />
  )
}

export default LazyInternalPage
