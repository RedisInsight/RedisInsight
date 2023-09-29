import React, { useContext, useState } from 'react'
import { startCase } from 'lodash'

import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { resourcesService } from 'uiSrc/services'
import EnablementAreaContext from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { ApiEndpoints } from 'uiSrc/constants'
import { getFileInfo } from '../../utils/getFileInfo'

import CodeButton from '../CodeButton'

export interface Props {
  label: string
  path?: string
  sourcePath?: string
}
const LazyCodeButton = ({ path = '', sourcePath, ...rest }: Props) => {
  const [isLoading, setLoading] = useState<boolean>(false)
  const [, setError] = useState<string>('')
  const { setScript } = useContext(EnablementAreaContext)

  const loadContent = async () => {
    if (path) {
      setLoading(true)
      setError('')
      try {
        const { data, status } = await resourcesService.get<string>(`${ApiEndpoints.TUTORIALS_PATH}${path}`)
        if (isStatusSuccessful(status)) {
          setLoading(false)
          const pageInfo = getFileInfo({ path })
          setScript(data, {}, { path: pageInfo.location, name: startCase(pageInfo.name) })
        }
      } catch (error) {
        setLoading(false)
        const errorMessage: string = getApiErrorMessage(error)
        setError(errorMessage)
      }
    }
  }

  if (!sourcePath?.startsWith(ApiEndpoints.TUTORIALS_PATH)) {
    return null
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
