import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService, } from 'uiSrc/services'
import { addErrorNotification, addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { IStateRdiPipeline, IPipeline } from 'uiSrc/slices/interfaces/rdi'
import { getApiErrorMessage, getAxiosError, getRdiUrl, isStatusSuccessful } from 'uiSrc/utils'
import { EnhancedAxiosError } from 'uiSrc/slices/interfaces'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { ApiEndpoints } from 'uiSrc/constants'
import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdiPipeline = {
  loading: true,
  error: '',
  data: null,
  isDeployPopoverOpen: false,
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
    deployPipeline: (state) => {
      state.loading = true
    },
    deployPipelineSuccess: (state) => {
      state.loading = false
    },
    deployPipelineFailure: (state) => {
      state.loading = false
    },
  },
})

export const rdiPipelineSelector = (state: RootState) => state.rdi.pipeline

export const {
  getPipeline,
  getPipelineSuccess,
  getPipelineFailure,
  deployPipeline,
  deployPipelineSuccess,
  deployPipelineFailure,
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
      const { data, status } = await apiService.get<IPipeline>(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_PIPELINE),
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

export function deployPipelineAction(
  rdiInstanceId: string,
  pipeline: IPipeline,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(deployPipeline())
      const { status } = await apiService.post(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_DEPLOY_PIPELINE),
        pipeline,
      )

      if (isStatusSuccessful(status)) {
        dispatch(deployPipelineSuccess())
        dispatch(addInfiniteNotification(INFINITE_MESSAGES.SUCCESS_DEPLOY_PIPELINE()))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const parsedError = getAxiosError(error as EnhancedAxiosError)

      dispatch(addErrorNotification(parsedError))
      dispatch(deployPipelineFailure())
      onFailAction?.()
    }
  }
}
