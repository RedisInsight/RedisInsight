import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ActionBarStatus, StateAppActionBar } from 'uiSrc/slices/interfaces'
import { RootState } from 'uiSrc/slices/store'

export const initialState: StateAppActionBar = {
  status: ActionBarStatus.Close,
  text: '',
  actions: []
}

const appActionBarSlice = createSlice({
  name: 'appActionBar',
  initialState,
  reducers: {
    setActionBarInitialState: () => initialState,

    setActionBarState: (state, { payload }: PayloadAction<StateAppActionBar>) => {
      const { status, actions, text } = { ...initialState, ...payload }
      state.status = status
      state.actions = actions
      state.text = text
    },
  }
})

export const {
  setActionBarInitialState,
  setActionBarState,
} = appActionBarSlice.actions

export const appActionBarSelector = (state: RootState) => state.app.actionBar

export default appActionBarSlice.reducer
