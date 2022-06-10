import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { StatePubSub } from 'uiSrc/slices/interfaces/pubsub'
import { RootState } from 'uiSrc/slices/store'
import { SubscriptionDto } from 'apiSrc/modules/pub-sub/dto/subscription.dto'
import { MessagesResponse } from 'apiSrc/modules/pub-sub/dto/messages.response'

export const initialState: StatePubSub = {
  loading: false,
  error: '',
  subscriptions: [],
  isSubscribeTriggered: false,
  isConnected: false,
  isSubscribed: false,
  messages: [],
  count: 0
}

export const PUB_SUB_ITEMS_MAX_COUNT = 5_000

const pubSubSlice = createSlice({
  name: 'pubsub',
  initialState,
  reducers: {
    setInitialPubSubState: () => initialState,
    setPubSubConnected: (state, { payload }: PayloadAction<boolean>) => {
      state.isConnected = payload
    },
    toggleSubscribeTriggerPubSub: (state, { payload }: PayloadAction<SubscriptionDto[]>) => {
      state.isSubscribeTriggered = !state.isSubscribeTriggered
      state.subscriptions = payload
    },
    setIsPubSubSubscribed: (state) => {
      state.isSubscribed = true
    },
    setIsPubSubUnSubscribed: (state) => {
      state.isSubscribed = false
    },
    concatPubSubMessages: (state, { payload }: PayloadAction<MessagesResponse>) => {
      state.count += payload.count
      if (payload.messages.length >= PUB_SUB_ITEMS_MAX_COUNT) {
        state.messages = [...payload.messages.slice(-PUB_SUB_ITEMS_MAX_COUNT)]
        return
      }

      let newItems = [...state.messages, ...payload.messages]

      if (newItems.length > PUB_SUB_ITEMS_MAX_COUNT) {
        newItems = newItems.slice(newItems.length - PUB_SUB_ITEMS_MAX_COUNT)
      }

      state.messages = newItems
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload
    },
    disconnectPubSub: (state) => {
      state.loading = false
      state.isSubscribed = false
      state.isSubscribeTriggered = false
      state.isConnected = false
    }
  }
})

export const {
  setInitialPubSubState,
  setPubSubConnected,
  toggleSubscribeTriggerPubSub,
  setIsPubSubSubscribed,
  setIsPubSubUnSubscribed,
  concatPubSubMessages,
  setLoading,
  disconnectPubSub
} = pubSubSlice.actions

export const pubSubSelector = (state: RootState) => state.pubsub

export default pubSubSlice.reducer
