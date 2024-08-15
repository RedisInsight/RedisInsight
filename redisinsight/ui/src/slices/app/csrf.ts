import { createSlice } from '@reduxjs/toolkit'
import { apiService } from 'uiSrc/services'
import { setApiCsrfHeader } from 'uiSrc/services/apiService';
import { setResourceCsrfHeader } from 'uiSrc/services/resourcesService';
import { AppDispatch, RootState } from '../store'

// const getCsrfEndpoint = () => process.env.RI_CSRF_ENDPOINT || ''
const getCsrfEndpoint = () => 'http://localhost:5540/api/csrf'

interface CSRFTokenResponse {
  token: string;
}

export type StateCsrf = {
  token: string;
}

export const initialState: {
  csrfEndpoint: string;
  loading: null | boolean;
  token: string;
} = {
  csrfEndpoint: getCsrfEndpoint(),
  loading: true,
  token: '',
}

const appCsrfSlice = createSlice({
  name: 'appCsrf',
  initialState,
  reducers: {
    setToken: (state, { payload }: { payload: { token: string } }) => { state.token = payload.token },
    setLoading: (state, { payload }: { payload: { loading: boolean } }) => { state.loading = payload.loading },
  }
})

const { setLoading, setToken } = appCsrfSlice.actions

export const appCsrfSelector = (state: RootState) => state.app.csrf

export default appCsrfSlice.reducer

export function fetchCsrfToken(
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch) => {
    try {
      const { data } = await apiService.get<CSRFTokenResponse>(getCsrfEndpoint())

      dispatch(setToken({ token: data.token }))
      setApiCsrfHeader(data.token)
      setResourceCsrfHeader(data.token)

      dispatch(setLoading({ loading: false }))

      onSuccessAction && onSuccessAction(data)
    } catch (error) {
      console.error('Error fetching CSRF token: ', error)
      onFailAction && onFailAction()
    } finally {
      dispatch(setLoading({ loading: false }))
    }
  }
}
