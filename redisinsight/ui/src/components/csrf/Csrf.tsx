import React, { ReactElement, useEffect, useState } from 'react'

import apiService, { setApiCsrfHeader } from 'uiSrc/services/apiService'
import { setResourceCsrfHeader } from 'uiSrc/services/resourcesService'
import PagePlaceholder from '../page-placeholder'

const getCsrfEndpoint = () => process.env.RI_CSRF_ENDPOINT || ''

interface CSRFTokenResponse {
  token: string;
}

const Csrf = ({ children }: { children: ReactElement }) => {
  // default to true to prevent other components from making requests before the CSRF token is fetched
  const [loading, setLoading] = useState(true)

  const fetchCsrfToken = async () => {
    let data: CSRFTokenResponse | undefined
    try {
      const { data } = await apiService.get<CSRFTokenResponse>(getCsrfEndpoint())

      setApiCsrfHeader(data.token)
      setResourceCsrfHeader(data.token)
    } catch (error) {
      console.error('Error fetching CSRF token: ', error)
    } finally {
      setLoading(false)
    }

    return { data }
  }

  useEffect(() => {
    if (!getCsrfEndpoint()) {
      return
    }

    fetchCsrfToken()
  }, [])

  return loading && getCsrfEndpoint() ? <PagePlaceholder /> : children
}

export default Csrf
