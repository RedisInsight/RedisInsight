import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService, } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { IStateRdi, IPipeline } from 'uiSrc/slices/interfaces/rdi'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'

import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdi = {
  loading: false,
  error: '',
  data: null,
}

const rdiPipelineSlice = createSlice({
  name: 'rdiPipeline',
  initialState,
  reducers: {
    getPipeline: (state) => {
      state.loading = true
    },
    getPipelineSuccess: (state, { payload }: PayloadAction<IPipeline>) => {
      state.loading = false
      state.data = payload
    },
    getPipelineFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  }
})

export const rdiSelector = (state: RootState) => state.rdi
export const rdiPipelineSelector = (state: RootState) => state.rdi.pipeline

export const {
  getPipeline,
  getPipelineSuccess,
  getPipelineFailure,
} = rdiPipelineSlice.actions

// The reducer
export default rdiPipelineSlice.reducer

// Asynchronous thunk action
export function fetchRdiPipeline(
  rdiInstanceId: string,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getPipeline())
      const { data, status } = await apiService.get<any>(
        // TODO connect with Kyle to find solution
        `rdi/${rdiInstanceId}/pipeline`
      )

      if (isStatusSuccessful(status)) {
        dispatch(getPipelineSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getPipelineFailure(errorMessage))
      onFailAction?.()
    }
  }
}
