import { createSlice, current } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { getApiErrorMessage, getApiErrorName } from 'uiSrc/utils'
import { IError, IMessage } from '../interfaces'

import { RootState } from '../store'

export const initialState = {
  errors: [] as IError[],
  messages: [] as IMessage[]
}

export interface IAddInstanceErrorPayload extends AxiosError {
  instanceId?: string,
}
// A slice for recipes
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addErrorNotification: (state, { payload }: { payload: IAddInstanceErrorPayload }) => {
      const { instanceId } = payload
      const errorName = getApiErrorName(payload)
      const message = getApiErrorMessage(payload)
      const errorExistedId = state.errors.findIndex(
        (err) => err.message === message
      )

      if (errorExistedId !== -1) {
        notificationsSlice.caseReducers.removeError(state, {
          payload: current(state.errors[errorExistedId])?.id ?? '',
        })
      }

      state.errors.push({
        ...payload,
        instanceId,
        id: `${Date.now()}`,
        name: errorName,
        message,
      })
    },
    removeError: (state, { payload = '' }: { payload: string }) => {
      state.errors = state.errors.filter((error) => error.id !== payload)
    },
    resetErrors: (state) => {
      state.errors = []
    },
    addMessageNotification: (state, { payload }) => {
      state.messages.push({
        ...payload,
        id: `${Date.now()}`,
        group: payload.group
      })
    },
    removeMessage: (state, { payload = '' }: { payload: string }) => {
      state.messages = state.messages.filter((message) => message.id !== payload)
      state.errors = state.errors.filter((error) => error.id !== payload)
    },
    resetMessages: (state) => {
      state.messages = []
    },
  },
})

// Actions generated from the slice
export const {
  addErrorNotification,
  removeError,
  resetErrors,
  addMessageNotification,
  removeMessage,
  resetMessages
} = notificationsSlice.actions

// Selectors
export const errorsSelector = (state: RootState) =>
  state.app.notifications.errors
export const messagesSelector = (state: RootState) =>
  state.app.notifications.messages

// The reducer
export default notificationsSlice.reducer
