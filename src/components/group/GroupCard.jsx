import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"
import { Modal, Button } from "react-bootstrap"

import { useGlobalSheet } from "../GlobalSheetProvider"
import { API, API_V2, DEFAULT_IMAGE } from "../../config"

import GroupSheetHeader from "../../components/group/GroupSheetHeader"
import SheetList from "../../components/SheetList"
import clipboard from "../../utils/clipboard.js"

import axios from "axios"
import Swal from "sweetalert2"

export default function GroupCard({ props }) {
  const [show, setShow] = useState(false)
  const [isOpen, setOpen] = useState(false)

  const [marker, setMarker] = useState()
  const [actions, setActions] = useState([])

  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)
  const { users, devices } = useSelector((state) => state.config)
  const { openSheet } = useGlobalSheet()

  const accounts = []

  useEffect(() => {
    if (props.mark !== undefined || props.mark !== null) setMarker(props.mark)
  }, [props])

  if (props.one) accounts.push("one")
  if (props.two) accounts.push("two")
  if (props.three) accounts.push("three")
  if (props.four) accounts.push("four")
  if (props.five) accounts.push("five")
  if (props.six) accounts.push("six")
  if (props.seven) accounts.push("seven")
  if (props.eight) accounts.push("eight")
  if (props.nine) accounts.push("nine")

  const editData = async (username, type, mark) => {
    if (type === "delete") {
      setOpen(false)

      const confirm = await Swal.fire({
        title: `REMOVE ${username} ?`,
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

    try {
      const el = document.getElementById(username)
      if (!el) return toast.error("cannot delete data", { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })

      const { data } = await axios.post(API_V2 + "/telegram/groups/edit", { username, type, mark })

      if (type === "mark") setMarker(mark)

      if (type === "delete") {
        el.classList.add("d-none")
        toast.success(data.message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      setOpen(false)
    }
  }

  const viewData = () => {
    setOpen(false)
    openSheet(props)
  }

  const actionGroup = async (key, join, action, inviteCode) => {
    if (action === "banned" || action === "error") return toast.warning(`account ${key} ${action} (${inviteCode})`)

    const toastId = toast.loading("Loading data...")

    try {
      const { data } = await axios.post(API + "/telegram/groups/action", { key, action, inviteCode })
      const { message } = data

      setActions(actions.map((x) => (x.key === key ? { ...x, join: !join, action: !join ? "leave" : "join" } : x)))

      const { data: send } = await axios.post(API + "/telegraf/message", { caption: `${username}: ${message}` })
      toast.success(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      toast.dismiss(toastId)
    }
  }

  const checkGroup = async (username) => {
    const toastId = toast.loading("Loading data...")
    const inviteCode = username

    try {
      const details = Array.from({ length: 10 })
        .map((x, i) => i + 1)
        .map(async (key) => {
          try {
            const { data } = await axios.post(API + "/telegram/groups/detail", { key, inviteCode })
            const { join, banned } = data

            const action = banned ? "banned" : join ? "leave" : "join"

            return { key, join, action, inviteCode }
          } catch (error) {
            return { key, join: false, action: "error", inviteCode }
          }
        })

      setActions(await Promise.all(details))
      setShow(true)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      toast.dismiss(toastId)
      setOpen(false)
    }
  }

  return (
    <>
      <div className="card group-card mb-3" id={props.username}>
        {marker ? (
          <div className="group-thumb-container-cover" onDoubleClick={() => editData(props.username, "mark", !marker)}>
            <span className="text-warning fw-bold ts-9">MARKED</span>
          </div>
        ) : (
          ""
        )}

        <div className="group-thumb-container position-relative">
          <img
            className="group-thumb w-100"
            alt="thumb"
            src={props.photo || DEFAULT_IMAGE}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
            onDoubleClick={() => editData(props.username, "mark", !marker)}
          />
          <div className="position-absolute text-white p-2 bottom-0 d-flex flex-wrap gap-2">
            {props.dana ? <div className="group-card-thumb-pill fw-bold bg-primary text-light">CONTAIN DANA</div> : ""}

            {accounts.map((x, i) => {
              return (
                <div className="group-card-thumb-pill fw-bold bg-dark text-light" key={i}>
                  ACCOUNT {x}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-body group-card-body bg-light text-dark p-3">
          <a href={props.url} className="text-dark fw-bold">
            {props.title}
          </a>
          <a href={props.url}>
            <p className="text-success my-1 fw-bold ts-9">{props.member} subsribers</p>
          </a>
          <p className="ts-8">{props.description}</p>

          <ul className="list-group">
            {props.preview && props.preview !== "???" ? (
              <a href={props.preview}>
                <li className="list-group-item text-center ts-7 group-card-li">HAS PREVIEW GROUP</li>
              </a>
            ) : (
              ""
            )}
            {props.photos && props.photos !== "???" ? <li className="list-group-item text-center ts-7 group-card-li">{props.photos} photos</li> : ""}
            {props.videos && props.videos !== "???" ? <li className="list-group-item text-center ts-7 group-card-li">{props.videos} videos</li> : ""}
            {props.files && props.files !== "???" ? <li className="list-group-item text-center ts-7 group-card-li">{props.files} files</li> : ""}
            {props.links && props.links !== "???" ? <li className="list-group-item text-center ts-7 group-card-li text-danger">{props.links} links</li> : ""}
          </ul>
        </div>

        <div className="py-2">
          <button className="btn btn-sm btn-success group-card-btn w-100 py-2" onClick={() => setOpen(true)}>
            ACTION
          </button>
        </div>
      </div>

      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} disableDrag={false} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header />
          <Sheet.Content className="px-3 disable-select">
            <GroupSheetHeader props={props} />
            <div className="row g-2">
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList
                  icon="open_in_new"
                  title="OPEN"
                  onClick={() => {
                    setOpen(false)
                    window.location.href = props.url
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList
                  icon="content_copy"
                  title="COPY URL"
                  onClick={() => {
                    clipboard(props.url)
                    setOpen(false)
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="code" title="view exists data" onClick={() => viewData()} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="bookmark" title={marker ? "UNMARK" : "MARK"} onClick={() => editData(props.username, "mark", !marker)} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="account_circle" title="CHECK WITH TELEGRAM" color="text-info" fill={true} onClick={() => checkGroup(props.username)} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="delete" title="REMOVE" color="text-danger" onClick={() => editData(props.username, "delete", false)} />
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>

      <Sheet isOpen={show} onClose={() => setShow(false)} disableDrag={true} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header className="px-3 py-3">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h5 className="m-0">{props.title}</h5>
                <p className="m-0 ts-8" id="input-session-info">
                  {props.url}
                </p>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setShow(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3 disable-select">
            <div className="row py-3 g-2">
              {actions.map((x, i) => {
                const { key, join, action, inviteCode } = x

                return (
                  <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1" key={i}>
                    <SheetList
                      fill={action === "error" || action === "banned" || action === "leave"}
                      color={action === "error" ? "text-warning" : action === "banned" ? "text-danger" : action === "leave" ? "text-success" : "text-light"}
                      icon="account_circle"
                      title={`ACCOUNT ${key} (${action})`}
                      border={true}
                      rightIcon={action === "leave" ? "check" : ""}
                      onClick={() => actionGroup(key, join, action, inviteCode)}
                    />
                  </div>
                )
              })}
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setShow(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>
    </>
  )
}
