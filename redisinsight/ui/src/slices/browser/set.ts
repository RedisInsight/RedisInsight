import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { first, remove } from 'lodash'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { bufferToString, getApiErrorMessage, getUrl, isStatusSuccessful, Maybe, stringToBuffer } from 'uiSrc/utils'
import {
  AddMembersToSetDto,
  GetSetMembersResponse,
} from 'apiSrc/modules/browser/dto/set.dto'

import successMessages from 'uiSrc/components/notifications/success-messages'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  deleteKeyFromList,
  deleteKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import { InitialStateSet, RedisResponseBuffer, RedisString } from '../interfaces'
import { addErrorNotification, addMessageNotification } from '../app/notifications'

export const initialState: InitialStateSet = {
  loading: false,
  error: '',
  data: {
    total: 0,
    key: '',
    keyName: '',
    members: [],
    nextCursor: 0,
    match: '*',
  },
}

// A slice for recipes
const setSlice = createSlice({
  name: 'set',
  initialState,
  reducers: {

    setSetMembers: (state, { payload }: PayloadAction<RedisString[]>) => {
      state.data.members = payload
    },
    // load Set members
    loadSetMembers: (state, { payload: [match, resetData = true] }: PayloadAction<[string, Maybe<boolean>]>) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }

      state.data = {
        ...state.data,
        match: match || '*'
      }
    },
    loadSetMembersSuccess: (
      state,
      { payload }: PayloadAction<GetSetMembersResponse>
    ) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.data.key = payload.keyName
      state.loading = false
    },
    loadSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // load more Set members for infinity scroll
    loadMoreSetMembers: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreSetMembersSuccess: (
      state,
      { payload: { members, ...rest } }: PayloadAction<GetSetMembersResponse>
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        members: state.data?.members?.concat(members),
      }
    },
    loadMoreSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    addSetMembers: (state) => {
      state.loading = true
      state.error = ''
    },
    addSetMembersSuccess: (state) => {
      state.loading = false
    },
    addSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    // delete Set members
    removeSetMembers: (state) => {
      state.loading = true
      state.error = ''
    },
    removeSetMembersSuccess: (state) => {
      state.loading = false
    },
    removeSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeMembersFromList: (state, { payload }: { payload: RedisResponseBuffer[] }) => {
      remove(
        state.data?.members,
        ({ data }: { data: any[] }) => first(payload)?.data.join('') === data.join('')
      )

      state.data = {
        ...state.data,
        total: state.data.total - 1,
      }
    },
  },
})

// Actions generated from the slice
export const {
  loadSetMembers,
  loadSetMembersSuccess,
  loadSetMembersFailure,
  loadMoreSetMembers,
  loadMoreSetMembersSuccess,
  loadMoreSetMembersFailure,
  addSetMembers,
  addSetMembersSuccess,
  addSetMembersFailure,
  removeSetMembers,
  removeSetMembersSuccess,
  removeSetMembersFailure,
  removeMembersFromList,
  setSetMembers,
} = setSlice.actions

// A selector
export const setSelector = (state: RootState) => state.browser.set
export const setDataSelector = (state: RootState) => state.browser.set?.data

// The reducer
export default setSlice.reducer

// Asynchronous thunk actions
export function fetchSetMembers(
  key: RedisResponseBuffer,
  cursor: number,
  count: number,
  match: string,
  resetData?: boolean,
  onSuccess?: (data: GetSetMembersResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadSetMembers([match, resetData]))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetSetMembersResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.SET_GET_MEMBERS
        ),
        {
          keyName: key,
          cursor,
          count,
          match,
          encoding,
        }
      )

      // TODO: REMOVE
      const newData = {
        ...data,
        members: data.members.map((member) => stringToBuffer(member))
      }

      if (isStatusSuccessful(status)) {
        dispatch(loadSetMembersSuccess(newData))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        onSuccess?.(data)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadSetMembersFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function fetchMoreSetMembers(
  key: string,
  cursor: number,
  count: number,
  match: string
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreSetMembers())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetSetMembersResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.SET_GET_MEMBERS
        ),
        {
          keyName: key,
          cursor,
          count,
          match,
          encoding,
        }
      )

      // TODO: REMOVE
      const newData = {
        ...data,
        members: data.members.map((member) => stringToBuffer(member))
      }

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreSetMembersSuccess(newData))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadMoreSetMembersFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function refreshSetMembersAction(key: RedisResponseBuffer, resetData?: boolean) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { match } = state.browser.set.data
    dispatch(loadSetMembers([match || '*', resetData]))

    try {
      const { data, status } = await apiService.post<GetSetMembersResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.SET_GET_MEMBERS
        ),
        {
          keyName: key,
          cursor: 0,
          count: SCAN_COUNT_DEFAULT,
          match,
        }
      )

      if (isStatusSuccessful(status)) {
        // TODO: REMOVE
        const newData = {
          ...data,
          members: data.members.map((member) => stringToBuffer(member))
        }

        dispatch(loadSetMembersSuccess(newData))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadSetMembersFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function addSetMembersAction(
  data: AddMembersToSetDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addSetMembers())

    try {
      const state = stateInit()
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.SET
        ),
        data
      )

      if (isStatusSuccessful(status)) {
        dispatch(addSetMembersSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(addSetMembersFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk actions
export function deleteSetMembers(key: string, members: string[], onSuccessAction?: () => void,) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeSetMembers())

    try {
      const state = stateInit()
      const { data, status } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.SET_MEMBERS
        ),
        {
          data: {
            keyName: key,
            members,
          },
        }
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        const newTotalValue = state.browser.set.data.total - data.affected
        dispatch(removeSetMembersSuccess())
        dispatch(removeMembersFromList(members))
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              bufferToString(key),
              members.map((member) => bufferToString(member)).join(''),
              'Member'
            )
          ))
        } else {
          dispatch(deleteKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(removeSetMembersFailure(errorMessage))
    }
  }
}
