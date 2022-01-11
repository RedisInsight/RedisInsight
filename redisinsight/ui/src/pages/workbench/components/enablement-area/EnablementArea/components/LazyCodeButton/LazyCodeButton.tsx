import React, { useContext, useState } from 'react'
import { startCase } from 'lodash'

import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { getFileInfo } from 'uiSrc/pages/workbench/components/enablement-area/EnablementArea/utils/getFileInfo'

import CodeButton from '../CodeButton'

export interface Props {
  label: string;
  path?: string;
}
const LazyCodeButton = ({ path = '', ...rest }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [, setError] = useState<string>('')
  const { setScript } = useContext(EnablementAreaContext)

  const loadContent = async () => {
    if (path) {
      setLoading(true)
      setError('')
      try {
        const { data, status } = await resourcesService.get<string>(path)
        if (isStatusSuccessful(status)) {
          setLoading(false)
          const pageInfo = getFileInfo(path)
          setScript(data, pageInfo.location, startCase(pageInfo.name))
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
