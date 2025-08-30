import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

import { GlobalSheetProvider } from "./components/GlobalSheetProvider"
import { ToastContainer, toast } from "react-toastify"

import "./App.css"

import Layout from "./Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Other from "./pages/Other"
import Chat from "./pages/Chat"
import Claim from "./pages/Claim"
import Monitor from "./pages/Monitor"
import Group from "./pages/Group"

function Protect({ isLogin }) {
  if (!isLogin) return <Navigate to="/login" replace />
  return <Outlet />
}

function Guest({ isLogin }) {
  if (isLogin) return <Navigate to="/" replace />
  return <Outlet />
}

function App() {
  const { accessToken } = useSelector((state) => state.auth)
  const isLogin = !!accessToken

  return (
    <>
      <ToastContainer />
      <GlobalSheetProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Guest isLogin={isLogin} />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<Layout />}>
              <Route element={<Protect isLogin={isLogin} />}>
                <Route path="/" element={<Home />} />
                <Route path="/chats" element={<Chat />} />
                <Route path="/monitor" element={<Monitor />} />
                <Route path="/claims" element={<Claim />} />
                <Route path="/others" element={<Other />} />
                <Route path="/groups" element={<Group />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalSheetProvider>
    </>
  )
}

export default App
