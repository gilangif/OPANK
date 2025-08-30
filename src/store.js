import { configureStore } from "@reduxjs/toolkit"

import authReducer from "./features/authSlice"
import configReducer from "./features/configSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    config: configReducer,
  },
})
