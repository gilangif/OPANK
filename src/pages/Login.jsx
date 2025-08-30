import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login } from "../features/authSlice"
import { API, API_V2, DEFAULT_IMAGE } from "../config"

import axios from "axios"

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [text, setText] = useState("Welcome back")
  const [focus, setFocus] = useState(null)

  const typing = async (t) => {
    for (let i = 0; i < t.length + 1; i++) {
      setText(t.slice(0, i))
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
    typing(t)
  }

  useEffect(() => {
    typing(text)
  }, [])

  const auth = async (e) => {
    try {
      e.preventDefault()

      const { data } = await axios.post(API + "/users/auth", { username, password })
      console.log("📢[:40]: ", data)
      const { id, role, avatar, accessToken, refreshToken } = data

      const message = `Welcome back ${username}`

      toast.success(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })

      dispatch(login(data))
      navigate("/")
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <form onSubmit={auth} className="form-signin" style={{ maxWidth: "420px" }}>
        <div className="text-center mb-6">
          <img className="mb-4" src={focus ? "/src/assets/pepe-typing.gif" : "/src/assets/pepe-inspace.gif"} alt="" width="110" height="110" />
          <h1 className="h3 mb-2 font-weight-normal">{text}</h1>
          <p>You can sign in to access with your existing account.</p>
        </div>

        <div className="form-label-group mt-4 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>

        <div className="form-label-group mb-5">
          <input
            type="password"
            id="inputPassword"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>

        <button className="btn btn-lg btn-sm btn-primary btn-block w-100 p-2" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
