import React, { useEffect, useState } from 'react'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import InternalPage from '../InternalPage'

export interface Props {
  onClose: () => void;
  title: string;
  backTitle: string;
  path: string;
}

const LazyInternalPage = ({ onClose, title, path, backTitle }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [content, setContent] = useState<string>('')

  const loadContent = async () => {
    setLoading(true)
    setError('')
    setContent('')
    try {
      const { data, status } = await resourcesService.get<string>(path)
      if (isStatusSuccessful(status)) {
        setLoading(false)
        setContent(data)
      }
    } catch (error) {
      setLoading(false)
      const errorMessage: string = getApiErrorMessage(error)
      setError(errorMessage)
    }
  }

  useEffect(() => {
    (async function () {
      await loadContent()
    }())
  }, [path])

  return (
    <InternalPage
      onClose={onClose}
      title={title}
      backTitle={backTitle}
      isLoading={isLoading}
      content={content}
      error={error}
    />
  )
}

export default LazyInternalPage
