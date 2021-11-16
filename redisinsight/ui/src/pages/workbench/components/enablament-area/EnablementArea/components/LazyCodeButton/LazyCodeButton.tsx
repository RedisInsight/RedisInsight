import React, { useContext, useState } from 'react'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import CodeButton from '../CodeButton'

export interface Props {
  label: string;
  path?: string;
}
const LazyCodeButton = ({ path = '', ...rest }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const { setScript } = useContext(EnablementAreaContext)

  const loadContent = async () => {
    if (path) {
      setLoading(true)
      setError('')
      try {
        const { data, status } = await resourcesService.get<string>(path)
        if (isStatusSuccessful(status)) {
          setLoading(false)
          setScript(data)
        }
      } catch (error) {
        setLoading(false)
        const errorMessage: string = getApiErrorMessage(error)
        setError(errorMessage)
      }
    }
  }

  return (
    <CodeButton
      isLoading={isLoading}
      onClick={loadContent}
      {...rest}
    />
  )
}

export default LazyCodeButton
