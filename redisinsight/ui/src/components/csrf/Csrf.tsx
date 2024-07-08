import React, { ReactElement, useEffect, useState } from 'react'

import apiService, { setCSRFHeader } from 'uiSrc/services/apiService'
import PagePlaceholder from '../page-placeholder'

const getCsrfEndpoint = () => process.env.RI_CSRF_ENDPOINT || ''

interface CSRFTokenResponse {
  token: string;
}

const Csrf = ({ children }: { children: ReactElement }) => {
  const [loading, setLoading] = useState(false)

  const fetchCsrfToken = async () => {
    let data: CSRFTokenResponse | undefined
    try {
      setLoading(true)

      const { data } = await apiService.get<CSRFTokenResponse>(getCsrfEndpoint())

      setCSRFHeader(data.token)
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
