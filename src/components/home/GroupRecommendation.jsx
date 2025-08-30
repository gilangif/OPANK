import { useLocation, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"

import { API, API_V2, DEFAULT_IMAGE } from "../../config"

import axios from "axios"

function CardRecommended({ photo, title, member, dana }) {
  const to = `/groups?search=${encodeURIComponent(title)}`

  return (
    <Link to={to}>
      <div className="card flex-shrink-0 border-0 carousel-card">
        <div className="position-relative">
          <img
            src={photo || DEFAULT_IMAGE}
            className="carousel-img rounded"
            alt=""
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
          />

          {dana && <div className="position-absolute bottom-0 start-0 text-white bg-dark px-2 py-1 m-1 carousel-img-contain">contain dana</div>}
        </div>

        <div className="card-body px-1 carousel-body-container disable-select">
          <h6 className="card-title ts-9 m-0 carousel-title">{title}</h6>
          <p className="card-text ts-8 small m-0">{member} subscribers</p>
        </div>
      </div>
    </Link>
  )
}

export default function GroupRecommended() {
  const [recommendation, setRecommendation] = useState([])

  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)

  const getRecommendation = async () => {
    try {
      const { data } = await axios.get(API_V2 + "/telegram/groups?limit=20&sort=desc&order=unmark")
      setRecommendation(data.data)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  useEffect(() => {
    getRecommendation()
  }, [])

  return (
    <div className="px-3 py-0">
      <div className="d-flex justify-content-between align-items-center disable-select py-2">
        <Link to="/groups">
          <p className="fw-bold m-0">Recommended for you</p>
        </Link>
        <Link to="/groups">
          <div className="px-2">
            <span className="material-symbols-outlined">chevron_forward</span>
          </div>
        </Link>
      </div>

      <div className="d-flex overflow-auto gap-2 hide-scroll carousel-container">
        {recommendation.map((x, i) => {
          return <CardRecommended key={i} photo={x.photo} title={x.title} member={x.member} dana={x.dana} />
        })}
      </div>
    </div>
  )
}
