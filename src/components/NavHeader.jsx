import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

import { dispatchUser } from "../features/configSlice"
import { logout } from "../features/authSlice"
import { API, API_V2, DEFAULT_IMAGE } from "../config"

import axios from "axios"
import Swal from "sweetalert2"

export default function NavHeader() {
  const [isOpen, setOpen] = useState(false)

  const [text, setText] = useState("")
  const [session, setSession] = useState("")

  const { accessToken, username, role, community, avatar } = useSelector((state) => state.auth)

  const dispatch = useDispatch()

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: `LOGOUT FROM ${username.toUpperCase()} ?`,
      text: "You won't be able to revert this",
      icon: "warning",
      showCancelButton: true,
      draggable: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#212529",
      confirmButtonText: "LOGOUT",
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

    dispatch(logout())
  }

  const getUsers = async () => {
    try {
      const { data } = await axios.get(API + "/dana/lists", { headers: { Authorization: `Bearer ${accessToken}` } })

      dispatch(dispatchUser(data.reverse()))
    } catch (error) {
      console.log(error)
      toast.error(error.message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  const addSession = async () => {
    try {
      const { data } = await axios.post(API + "/dana/add", { ALIPAYJSESSIONID: session }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { ALIPAYJSESSIONID, result, message } = data

      await getUsers()

      toast.success(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      setOpen(false)
    }
  }

  useEffect(() => {
    const el = document.getElementById("input-session-info")
    const add = document.getElementById("header-session-add")
    const remove = document.getElementById("header-session-remove")

    const match = text?.match(/GZ00(.*?)GZ00/)

    if (match && match[0]) setSession(match[0])

    if (remove) {
      remove.classList.toggle("d-block", !!text)
      remove.classList.toggle("d-none", !text)
    }

    if (add) {
      add.classList.toggle("d-block", !!match)
      add.classList.toggle("d-none", !match)
    }

    if (el && !text) {
      el.innerHTML = "PLEASE INPUT SESSION"
      el.style.color = "white"
    }

    if (el && text && !match) {
      el.innerHTML = "NOT FOUND"
      el.style.color = "red"
    }

    if (el && text && match) {
      el.innerHTML = match[0]
      el.style.color = "#198754"
    }
  }, [text, isOpen])

  return (
    <>
      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} disableDrag={true} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header className="px-3 py-2">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h6 className="m-0">ALIPAYJSESSIONID</h6>
                <p className="m-0 ts-7" id="input-session-info">
                  PLEASE INPUT SESSION
                </p>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold d-none" id="header-session-remove" onClick={() => setText("")}>
                  delete
                </span>
                <span className="material-symbols-outlined p-2 fw-bold d-none" id="header-session-add" onClick={() => addSession()}>
                  add
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3">
            <div className="form-floating py-1 py-lg-4">
              <textarea className="form-control" style={{ height: "35vh" }} id="header-input-textarea" value={text} onChange={(e) => setText(e.target.value)}></textarea>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>

      <div className="d-flex flex-row px-3 py-4 text-light">
        <div className="col d-flex flex-column justify-content-center align-items-start disable-select">
          <h5 className="fw-bold p-0 m-0 header-title-text text-capitalize">Hi, {username}</h5>
          <p className="p-0 m-0">
            role {role} with {community} community
          </p>
        </div>
        <div className="d-flex justify-content-end align-items-center gap-3">
          <div className="header-profile-icon-box">
            <span className="material-symbols-outlined text-light header-add-icon" onClick={() => setOpen(true)}>
              edit
            </span>
          </div>
          <div className="header-profile-icon-box">
            <img src={avatar || DEFAULT_IMAGE} alt="" className="header-profile-img" onClick={() => handleLogout()} />
          </div>
        </div>
      </div>
    </>
  )
}
