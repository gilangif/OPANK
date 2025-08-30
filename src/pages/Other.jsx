import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { API, API_V2, DEFAULT_IMAGE } from "../config"

import ButtonFloat from "../components/ButtonFloat"

import axios from "axios"
import Swal from "sweetalert2"

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

export default function Other() {
  const [isOpen, setOpen] = useState(false)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const [text, setText] = useState("https://t.me/+GiRGS6zs2-M5OGQ1")
  const [type, setType] = useState("1")

  const [msg, setMsg] = useState("")
  const [pages, setPages] = useState([])

  const [temp, setTemp] = useState({})

  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)
  const { users, devices } = useSelector((state) => state.config)

  const getPages = async () => {
    try {
      const { data: groups } = await axios.post(API_V2 + "/browser/pages")
      const { pages, message } = groups

      const pgs = pages.map((x) => ({ ...x, target: x.url.split("#@")[1], group: `https://t.me/${x.url.split("#@")[1]}` }))

      setMsg(message)
      setPages(pgs)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  const pagesAction = async (obj, action) => {
    const { id, url, target } = obj

    if (action === "close") {
      setShow(false)

      const confirm = await Swal.fire({
        title: `REMOVE ${target} ?`,
        text: "You won't be able to revert this",
        icon: "warning",
        showCancelButton: true,
        draggable: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#212529",
        confirmButtonText: "DELETE",
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

    const toastId = toast.loading(`Loading page ${target}`)

    try {
      setLoading(true)

      const { data } = await axios.post(API_V2 + "/browser/pages", { id, action })
      const { buffer, message } = data

      if (action === "screenshot" && buffer) {
        const uint8Array = new Uint8Array(buffer.data)
        const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        const base64img = `data:image/png;base64,${btoa(binary)}`

        setTemp({ ...obj, base64img })
        setPages(pages.map((x) => (x.id == id ? { ...x, base64img } : x)))

        return
      }

      if (action === "close") setPages(pages.filter((x) => x.id !== id))

      setShow(false)
      toast.success(message, { position: "top-right", autoClose: 1500, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  const pagesAdd = async () => {
    const match = text.replace(/[()]/g, "").match(/^https:\/\/t\.me\/(@?[a-zA-Z0-9_]{5,32}|\+[a-zA-Z0-9_-]{16,})(?:\/\d+)?(?:\?.*)?$/)

    setOpen(false)

    if (!match) {
      return toast.error("cannot find telegram link from input", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "colored",
      })
    }

    const toastId = toast.loading(`Add group to standby mode`)

    try {
      const body = { target: match[1] }

      if (type === "2") body.discuss = true

      const { data } = await axios.post(API_V2 + "/browser/telegram/standby", body)
      const { id, url, pages, buffer, message } = data

      const pgs = pages.map((x) => ({ ...x, target: x.url.split("#@")[1], group: `https://t.me/${x.url.split("#@")[1]}` }))

      if (buffer) {
        const uint8Array = new Uint8Array(buffer.data)
        const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        const base64img = `data:image/png;base64,${btoa(binary)}`

        setTemp({ base64img })
        setPages(pgs.map((x) => (x.id === id ? { ...x, base64img } : x)))
      } else {
        setPages(pgs)
      }

      toast.success(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      toast.dismiss(toastId)
    }
  }

  useEffect(() => {
    getPages()
  }, [])

  return (
    <>
      <div className="p-3">
        <div className="mx-auto col-12 col-md-11 col-lg-8">
          <div className="py-3 mb-4">
            <h5 className="fw-bold">STANDBY MODE</h5>
            <p className="ts-8 m-0">{msg}</p>
          </div>
          <div className="table-responsive hide-scroll disable-select">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">TARGET</th>
                  <th scope="col">GROUP</th>
                  <th scope="col">URL</th>
                  <th scope="col">ID</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((x, i) => {
                  const { id, url, group, target } = x

                  return (
                    <tr
                      key={i}
                      onClick={() => {
                        setTemp(x)
                        setShow(true)
                      }}
                    >
                      <td className="py-3">{i + 1}</td>
                      <td className="py-3">{group}</td>
                      <td className="py-3">{target}</td>
                      <td className="py-3">{url}</td>
                      <td className="py-3">{id}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Sheet isOpen={show} onClose={() => setShow(false)} disableDrag={false} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header />

          <Sheet.Content className="px-3">
            <div className="d-flex flex-row gap-3">
              <div className="sheet-thumb-box flex-shrink-0">
                <div className="sheet-thumb d-flex justify-content-center align-items-center" style={{ background: randomColor(temp.target).background, color: randomColor(temp.target).color }}>
                  {loading ? (
                    <div className="spinner-border" role="status" style={{ background: randomColor(temp.target).background, color: randomColor(temp.target).color }}>
                      <span className="sr-only"></span>
                    </div>
                  ) : (
                    <h3 className="fw-bold text-uppercase">{randomColor(temp.target).initial}</h3>
                  )}
                </div>
              </div>

              <div className="col d-flex flex-column justify-content-between disable-select">
                <div>
                  <h5 className="col fw-bold m-0 word-break">{temp.target}</h5>
                  <p className="ts-8 m-0">{temp.id}</p>
                </div>

                <p className="ts-8">{temp.url}</p>
                <div className="d-flex gap-2">
                  <button className="col btn btn-sm btn-primary" onClick={() => pagesAction(temp, "screenshot")}>
                    CAPTURE
                  </button>
                  <button className="col btn btn-sm btn-info" onClick={() => pagesAction(temp, "reload")}>
                    RELOAD
                  </button>
                  <button className="col btn btn-sm btn-danger" onClick={() => pagesAction(temp, "close")}>
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
            <div className="my-3 table-responsive">
              <img
                src={temp.base64img || DEFAULT_IMAGE}
                alt=""
                className="pages-sheet-thumb"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = DEFAULT_IMAGE
                }}
              />
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setShow(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>

      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} disableDrag={true} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header className="px-3 py-2">
            <div className="d-flex disable-select">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h6 className="m-0">ADD STANDBY MODE</h6>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => pagesAdd()}>
                  add
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setText("")}>
                  delete
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3">
            <div className="py-3">
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="1">CHANNEL & GROUP</option>
                <option value="2">GROUP DISCUSSION</option>
              </select>
            </div>
            <div className="form-floating py-1">
              <textarea className="form-control" style={{ height: "15vh" }} id="header-input-textarea" value={text} onChange={(e) => setText(e.target.value)}></textarea>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>

      <ButtonFloat icon="add" background="bg-danger" onClick={() => setOpen(true)} />
    </>
  )
}
