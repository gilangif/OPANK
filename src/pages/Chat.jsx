import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState, useRef } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { dispatchChat } from "../features/configSlice.js"
import { API, API_V2, DEFAULT_IMAGE } from "../config"

import ButtonFloat from "../components/ButtonFloat.jsx"
import socket from "../utils/socket.io"
import timestamp from "../utils/ts.js"

const hexToRgb = (hex) => {
  hex = hex.replace("#", "")
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const luminance = ({ r, g, b }) => {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

const randomColor = (name = "?") => {
  const parts = name.trim().split(/[\s_]+/)

  let initial
  if (parts.length >= 2) {
    initial = parts[0][0] + parts[1][0]
  } else {
    initial = parts[0].slice(0, 2)
  }
  initial = initial.toUpperCase()

  const colorHash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#198754", "#20c997", "#0dcaf0", "#ffc107", "#fd7e14", "#dc3545"]
  const background = colors[colorHash % colors.length]

  const lum = luminance(hexToRgb(background))
  const color = lum > 0.5 ? "#000000" : "#ffffff"

  return { initial, background, color }
}

function ChatCard({ account, title, name, chat, created }) {
  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)

  return (
    <>
      <div className="d-flex flex-row gap-2 w-100">
        <div className="d-flex justify-content-center align-items-end">
          <div className="chat-profile-thumb-container">
            <div
              className="chat-profile-thumb fw-bold ts-8 d-flex justify-content-center align-items-center p-2"
              style={{ background: randomColor(String(account)).background, color: randomColor(String(account)).color }}
            >
              {account}
            </div>
          </div>
        </div>

        <div className="d-flex w-100">
          <div className="d-flex flex-column justify-content-center align-items-start chat-bubble bg-light text-dark px-3 py-2 ts-9">
            <div className="d-flex w-100 gap-2">
              <div>
                <p className="ts-9 m-0 text-danger fw-bold">{title.trim()}</p>
              </div>
              <div className="col d-flex justify-content-end align-items-center text-dark p-0 m-0">
                <p className="ts-7 m-0">{created}</p>
              </div>
            </div>
            <p className="ts-8 m-0 text-dark fw-bold">{name.trim()}</p>
            <p className="ts-8 m-0 text-dark">{chat}</p>
          </div>
        </div>
      </div>
    </>
  )
}

const config = { start: new Date() }

export default function Chat() {
  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)
  const { chats } = useSelector((state) => state.config)

  const [showScroll, setShowScroll] = useState(false)

  const chatContainerRef = useRef(null)
  const isUserScrolling = useRef(false)
  const scrollTimeoutRef = useRef(null)

  const dispatch = useDispatch()

  const scrollToBottom = () => (chatContainerRef.current && !isUserScrolling.current ? (chatContainerRef.current.scrollTop = 0) : "")

  const handleScroll = () => {
    isUserScrolling.current = true

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

    scrollTimeoutRef.current = setTimeout(() => {
      const container = chatContainerRef.current

      if (container) {
        const isNearBottom = container.scrollTop < 100
        isUserScrolling.current = !isNearBottom
      }
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      const container = chatContainerRef.current
      if (container) setShowScroll(container.scrollTop < -container.clientHeight / 3)
    }
  }, [chats])

  useEffect(() => {
    const handleConnect = async () => socket.emit("hs", { model: `${username} WEB LIVE`, start: config.start })

    const handleHS = async (data) => {
      const { id, model, start, community, online, status } = data
      const text = `${model} connected`

      if (status === "private") {
        config.device = { ...config.device, model, start, community, id }
        socket.device = { ...config.device, model, start, community, id }

        toast.success(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
      } else {
        toast.info(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
      }

      console.log(status === "private" ? "\x1b[32m" : "\x1b[35m")
      console.log(`# ${timestamp()} (${online} online)`)
      console.log(`  ${model} connected (${id})`)
      console.log(`  comunity ${community}`)
      console.log("\x1b[0m")
    }

    const handleDisconnect = (data) => {
      const { id, model, start, community, duration, online } = data
      const text = `${model} disconnected (${duration})`

      toast.warning(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })

      console.log("\x1b[33m")
      console.log(`# ${timestamp()} (${online} online)`)
      console.log(`  ${model} disconnected (${id})`)
      console.log(`  comunity ${community}`)
      console.log("\x1b[33m")
      console.log(`  start    : ${timestamp(new Date(start))}`)
      console.log(`  end      : ${timestamp(new Date())}`)
      console.log(`  duration : ${duration}`)
      console.log("\x1b[0m")
    }

    const handleDisconnectServer = () => {
      const text = "server network disconnect"
      toast.warning(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })

      console.log("\x1b[33m")
      console.log(`# ${timestamp()}`)
      console.log(`  Server network disconnected`)
      console.log("\x1b[0m")
    }

    const handleConnectError = (err) => {
      console.log("\x1b[31m")
      console.log(`# ${timestamp(null, "time")} : socket connection ${err}`)
      console.log("\x1b[0m")
    }

    const handleMessage = (msg) => {
      const key = msg.key
      const title = msg.group.title
      const chat = msg.chat
      const name = msg.name
      const created = timestamp(msg.created, "time")

      dispatch(dispatchChat({ key, title, name, chat, created }))
    }

    if (!socket.connected) {
      socket.open()

      socket.on("connect", handleConnect)
      socket.on("hs", handleHS)
      socket.on("dc", handleDisconnect)
      socket.on("disconnect", handleDisconnectServer)
      socket.on("connect_error", handleConnectError)

      socket.on("message", handleMessage)
    }

    return () => {
      socket.removeAllListeners()
      socket.close()
    }
  }, [])

  return (
    <>
      <div className="px-3" style={{ height: "calc(100dvh - 80px)", display: "flex", flexDirection: "column" }}>
        <div
          ref={chatContainerRef}
          className="mx-auto col-12 col-md-11 col-lg-8 d-flex gap-2 hide-scroll"
          style={{ height: "100%", overflowY: "auto", flexDirection: "column-reverse", paddingBottom: "10px" }}
          onScroll={handleScroll}
        >
          {chats
            .slice()
            .reverse()
            .map((x, i) => {
              return <ChatCard key={chats.length - 1 - i} account={x.key} title={x.title} name={x.name} chat={x.chat} created={x.created} />
            })}
        </div>
      </div>

      {showScroll ? <ButtonFloat icon="arrow_cool_down" onClick={() => scrollToBottom()} /> : ""}
    </>
  )
}
