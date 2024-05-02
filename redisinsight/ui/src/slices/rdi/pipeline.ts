import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService, } from 'uiSrc/services'
import { addErrorNotification, addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import {
  IStateRdiPipeline,
  IPipeline,
  FileChangeType,
  IPipelineJSON,
  IRdiPipelineStrategy,
} from 'uiSrc/slices/interfaces/rdi'
import { getApiErrorMessage, getAxiosError, getRdiUrl, isStatusSuccessful, Nullable, pipelineToYaml } from 'uiSrc/utils'
import { EnhancedAxiosError } from 'uiSrc/slices/interfaces'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { ApiEndpoints } from 'uiSrc/constants'
import { AppDispatch, RootState } from '../store'

export const initialState: IStateRdiPipeline = {
  loading: false,
  error: '',
  data: null,
  schema: null,
  strategies: {
    loading: false,
    error: '',
    data: [],
  },
  changes: {},
}

const rdiPipelineSlice = createSlice({
  name: 'rdiPipeline',
  initialState,
  reducers: {
    setPipelineInitialState: () => initialState,
    setPipeline: (state, { payload }: PayloadAction<IPipeline>) => {
      state.data = payload
    },
    getPipeline: (state) => {
      state.loading = true
    },
    getPipelineSuccess: (state, { payload }: PayloadAction<IPipeline>) => {
      state.loading = false
      state.data = payload
    },
    getPipelineFailure: (state, { payload }: PayloadAction<string>) => {
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
    setPipelineSchema: (state, { payload }: PayloadAction<Nullable<object>>) => {
      state.schema = payload
    },
    getPipelineStrategies: (state) => {
      state.strategies.loading = true
    },
    getPipelineStrategiesSuccess: (state, { payload }: PayloadAction<IRdiPipelineStrategy[]>) => {
      state.strategies = {
        loading: false,
        error: '',
        data: payload,
      }
    },
    getPipelineStrategiesFailure: (state, { payload }) => {
      state.strategies = {
        loading: false,
        error: payload,
        data: []
      }
    },
    setChangedFile: (state, { payload }: PayloadAction<{ name: string, status: FileChangeType }>) => {
      state.changes[payload.name] = payload.status
    },
    setChangedFiles: (state, { payload }: PayloadAction<Record<string, FileChangeType>>) => {
      state.changes = payload
    },
    deleteChangedFile: (state, { payload }: PayloadAction<string>) => {
      delete state.changes[payload]
    }
  },
})

export const rdiPipelineSelector = (state: RootState) => state.rdi.pipeline

export const rdiPipelineStrategiesSelector = (state: RootState) => state.rdi.pipeline.strategies

export const {
  getPipeline,
  getPipelineSuccess,
  getPipelineFailure,
  deployPipeline,
  deployPipelineSuccess,
  deployPipelineFailure,
  setPipelineSchema,
  getPipelineStrategies,
  getPipelineStrategiesSuccess,
  getPipelineStrategiesFailure,
  setPipeline,
  setPipelineInitialState,
  setChangedFile,
  setChangedFiles,
  deleteChangedFile,
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
      const { data, status } = await apiService.get<IPipelineJSON>(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_PIPELINE),
      )
      if (isStatusSuccessful(status)) {
        dispatch(getPipelineSuccess(pipelineToYaml(data)))
        dispatch(setChangedFiles({}))

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
  pipeline: IPipelineJSON,
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

export function fetchPipelineStrategies(
  rdiInstanceId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getPipelineStrategies())
      const { status, data } = await apiService.get<{ strategies: IRdiPipelineStrategy[] }>(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_PIPELINE_STRATEGIES),
      )

      if (isStatusSuccessful(status)) {
        dispatch(getPipelineStrategiesSuccess(data.strategies))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const parsedError = getApiErrorMessage(error as EnhancedAxiosError)

      dispatch(getPipelineStrategiesFailure(parsedError))
      onFailAction?.()
    }
  }
}

export function fetchPipelineTemplate(
  rdiInstanceId: string,
  // TODO add interface
  options: any,
  onSuccessAction?: (template: string) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const { status, data } = await apiService.get(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_PIPELINE_TEMPLATE),
        { params: options },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.(data.template)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const parsedError = getAxiosError(error as EnhancedAxiosError)

      dispatch(addErrorNotification(parsedError))
      onFailAction?.()
    }
  }
}

export function fetchRdiPipelineSchema(
  rdiInstanceId: string,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, status } = await apiService.get<IPipeline>(
        getRdiUrl(rdiInstanceId, ApiEndpoints.RDI_PIPELINE_SCHEMA),
      )

      if (isStatusSuccessful(status)) {
        dispatch(setPipelineSchema(data))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      dispatch(setPipelineSchema(null))
      onFailAction?.()
    }
  }
}

export function deletePipelineJob(
  name: string
) {
  return (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { data } = state.rdi.pipeline
    if (data?.jobs?.find((el) => el.name === name)) {
      dispatch(setChangedFile({ name, status: FileChangeType.Removed }))
    } else {
      dispatch(deleteChangedFile(name))
    }
  }
}
