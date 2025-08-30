import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  users: [],
  devices: [],
  claims: [],
  chats: [],
  statementList: {},
}

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    dispatchUser: (state, action) => {
      state.users = action.payload
    },
    dispatchDevice: (state, action) => {
      state.devices = action.payload
    },
    dispatchClaim: (state, action) => {
      state.claims = action.payload
    },
    dispatchStatement: (state, action) => {
      state.statementList = action.payload
    },
    dispatchChat: (state, action) => {
      if (state.chats.length > 100) state.chats.shift()
      state.chats.push(action.payload)
    },
  },
})

export const { dispatchUser, dispatchDevice, dispatchClaim, dispatchStatement, dispatchChat } = configSlice.actions
export default configSlice.reducer
