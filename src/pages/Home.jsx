import { useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { API, API_V2, DEFAULT_IMAGE } from "../config"

import NavHeader from "../components/NavHeader"
import GroupRecommended from "../components/home/GroupRecommendation"
import UserContainer from "../components/home/UserContainer"
import DeviceContainer from "../components/home/DeviceContainer"

import axios from "axios"

function Notification() {
  const [offline, setOffline] = useState([])

  const getOffline = async () => {
    try {
      const { data } = await axios.get(API + "/socket/offline")
      setOffline(data)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  useEffect(() => {
    getOffline()
  }, [])

  if (offline.length === 0) return

  return (
    <div className="p-2">
      <div className="alert alert-success ts-9 disable-select" role="alert">
        <h6 className="alert-heading">Attention</h6>
        <p className="m-0">{offline.length} devices are currently disconnected from the network. Please check the connections and ensure all devices are properly connected to the network.</p>
        <hr />
        <div className="px-1">
          {offline.map((x, i) => {
            return (
              <li key={i} className="fw-bold mx-1">
                {x}
              </li>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const auth = useSelector((state) => state.auth)

  return (
    <div className="">
      <NavHeader />
      <Notification />
      <GroupRecommended />

      <UserContainer />
      <DeviceContainer />
    </div>
  )
}
