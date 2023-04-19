import { EuiButton } from '@elastic/eui'
import { useSelector } from 'react-redux'
import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { getApiErrorMessage, getUrl, isStatusSuccessful, truncateText } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

export interface Props {
  label: string
  path: string
}

const RedisUploadButton = ({ label, path }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useSelector(connectedInstanceSelector)

  const uploadData = async () => {
    setIsLoading(true)

    try {
      const { status, data } = await apiService.post(
        getUrl(
          id,
          ApiEndpoints.BULK_ACTIONS_IMPORT_TUTORIAL_DATA
        ),
        { path },
      )

      if (isStatusSuccessful(status)) {
        // todo: result data message
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      // todo: show error message
    }

    setIsLoading(false)
  }

  return (
    <EuiButton
      iconSide="right"
      isLoading={isLoading}
      size="s"
      onClick={uploadData}
      fullWidth
      color="secondary"
      disabled={isLoading}
    >
      {truncateText(label, 86)}
    </EuiButton>
  )
}

export default RedisUploadButton
