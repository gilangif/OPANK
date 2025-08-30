import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  avatar: localStorage.getItem("avatar") || "",
  role: localStorage.getItem("role") || "",
  accessToken: localStorage.getItem("accessToken") || "",
  community: localStorage.getItem("community") || "",
  username: localStorage.getItem("username") || "anonymous",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { username, role, community, avatar, accessToken } = action.payload

      state.role = role
      state.avatar = avatar
      state.username = username
      state.community = community
      state.accessToken = accessToken

      localStorage.setItem("role", role)
      localStorage.setItem("username", username)
      localStorage.setItem("avatar", avatar)
      localStorage.setItem("community", community)
      localStorage.setItem("accessToken", accessToken)
    },

    logout: (state) => {
      state.role = ""
      state.avatar = ""
      state.username = ""
      state.community = ""
      state.accessToken = ""

      localStorage.removeItem("role")
      localStorage.removeItem("avatar")
      localStorage.removeItem("username")
      localStorage.removeItem("community")
      localStorage.removeItem("accessToken")
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
