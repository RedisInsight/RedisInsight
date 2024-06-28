import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchCsrfToken } from 'uiSrc/slices/app/csrf'

const Csrf = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchCsrfToken())
  }, [])

  return null
}

export default Csrf
