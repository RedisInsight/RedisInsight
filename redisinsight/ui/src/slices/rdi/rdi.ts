import { createSlice } from '@reduxjs/toolkit'
import { RootState } from 'uiSrc/slices/store'

export const initialState: any = {
}

const appRdiSlice = createSlice({
  name: 'appRdi',
  initialState,
  reducers: {
    setRdiInitialState: () => initialState,
  }
})

export const {
  setRdiInitialState,
} = appRdiSlice.actions

export const appActionBarSelector = (state: RootState) => state.rdi

export default appRdiSlice.reducer
