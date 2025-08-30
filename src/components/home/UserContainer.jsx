import { useDispatch, useSelector } from "react-redux"
import { Sheet } from "react-modal-sheet"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

import { dispatchUser, dispatchDevice } from "../../features/configSlice"
import { API, API_V2, DEFAULT_IMAGE } from "../../config"
import { useGlobalSheet } from "../GlobalSheetProvider"
import { logout } from "../../features/authSlice"

import SheetDetailHeader from "./SheetDetailHeader"
import clipboard from "../../utils/clipboard"
import SheetList from "../SheetList"

import axios from "axios"
import Swal from "sweetalert2"

function UserCard({ id, thumb, title, community, start, balance, session, data }) {
  const [isOpen, setOpen] = useState(false)

  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)
  const { openSheet } = useGlobalSheet()

  const removeSession = async () => {
    setOpen(false)

    const confirm = await Swal.fire({
      title: `REMOVE ${title} ?`,
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

    try {
      const { data } = await axios.post(API + "/dana/remove", { nickname: title }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { message } = data

      const el = document.getElementById(id)

      if (el) {
        el.classList.add("d-none")
        toast.success(message, { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
      }
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      setOpen(false)
    }
  }

  const checkSession = async () => {
    try {
      const { data } = await axios.post(API + "/dana/check", { ALIPAYJSESSIONID: session }, { headers: { Authorization: `Bearer ${accessToken}` } })
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

  const bc = /[A-Za-z]/.test(balance) || /\*/.test(balance) || /\./.test(balance) ? balance : new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(balance)

  return (
    <>
      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark">
          <Sheet.Header />
          <Sheet.Content className="px-3 py-2 p-lg-3">
            <SheetDetailHeader thumb={thumb || DEFAULT_IMAGE} title={title} community={community} balance={balance} session={session} start={start} />

            <div className="row g-3">
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="content_copy" title="copy session" onClick={() => copy(session)} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="experiment" title="check" onClick={() => checkSession()} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="code" title="view exists data" onClick={() => viewData()} />
              </div>
              <div className="col-12 col-md-6 col-lg-3 px-1 py-0 px-lg-2 py-lg-1">
                <SheetList icon="close" title="remove" onClick={() => removeSession()} />
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setOpen(false)} />
      </Sheet>

      <div className="d-flex justify-content-center align-items-center gap-1 user-card p-0 rounded" style={{ background: bc === "Unauthorized" ? "rgba(255, 0, 0, 0.37)" : "" }}>
        <div className="user-img-box flex-shrink-0">
          <img
            src={thumb || DEFAULT_IMAGE}
            alt=""
            className="user-img"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
          />
        </div>

        <div className="d-flex flex-grow-1">
          <div className="w-100 d-flex flex-column justify-content-start align-items-start p-2 gap-2 disable-select">
            <p className="p-0 m-0 fw-bold ts-9 user-card-title text-uppercase">{title}</p>
            <p className="p-0 m-0 ts-8 text-light">{community} community</p>
            <p className="p-0 m-0 ts-8">Rp.{bc}</p>
          </div>
          <div className="d-flex justify-content-center align-items-center p-2 disable-select flex-shrink-0">
            <span className="material-symbols-outlined fw-bold text-light" style={{ scale: "0.8" }} onClick={() => setOpen(true)}>
              more_vert
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function UserContainer() {
  const { accessToken, username } = useSelector((state) => state.auth)
  const { users, devices } = useSelector((state) => state.config)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getUsers = async () => {
    try {
      const { data } = await axios.get(API + "/dana/lists", { headers: { Authorization: `Bearer ${accessToken}` } })

      const arr = data.sort((a, b) => {
        if (a.balance_display === "Unauthorized" && b.balance_display !== "Unauthorized") return -1
        if (a.balance_display !== "Unauthorized" && b.balance_display === "Unauthorized") return 1

        if (a.user_username === username && b.user_username !== username) return -1
        if (a.user_username !== username && b.user_username === username) return 1

        return new Date(b.updated_at) - new Date(a.updated_at)
      })

      dispatch(dispatchUser(arr))
    } catch (error) {
      const status = err.status && typeof err.status === "number" ? err.status : err.response && err.response.status ? err.response.status : 500
      const message = err.response && err.response.data.message ? err.response.data.message : "Internal Server Error"

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
    getUsers()
  }, [])

  if (users.length === 0) return

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center disable-select py-2">
        <p className="fw-bold m-0 mb-3">USERS ({users.length})</p>
      </div>
      <div className="row g-2">
        {users.map((x, i) => {
          const { id, userid, ALIPAYJSESSIONID, nickname, balance, balance_display, avatar, model, type, data, created_at, updated_at, user_id, user_username, user_role, user_community } = x

          return (
            <div key={i} className="col-12 col-md-6 col-lg-3" id={id}>
              <UserCard id={id} thumb={avatar} title={nickname} community={user_community} balance={balance} start={updated_at} session={ALIPAYJSESSIONID} data={x} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
