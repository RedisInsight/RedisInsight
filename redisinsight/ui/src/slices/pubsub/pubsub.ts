import { createSlice } from '@reduxjs/toolkit'
import { StatePubSub } from 'uiSrc/slices/interfaces/pubsub'

export const initialState: StatePubSub = {
  loading: false,
  error: ''
}

const pubSubSlice = createSlice({
  name: 'pubsub',
  initialState,
  reducers: {
    setInitialPubSubState: () => initialState,
  }
})

export default pubSubSlice.reducer
