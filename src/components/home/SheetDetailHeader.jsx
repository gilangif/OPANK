import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { API, API_V2, DEFAULT_IMAGE } from "../../config"

export default function SheetDetailHeader({ thumb, title, community, start, session, balance, balanceDisplay }) {
  const [duration, setDuration] = useState("00:00:00")

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
      <div className="d-flex flex-row gap-3">
        <div className="sheet-thumb-box flex-shrink-0">
          <img
            src={thumb || DEFAULT_IMAGE}
            alt=""
            className="sheet-thumb"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
          />
        </div>

        <div className="col d-flex flex-column justify-content-around disable-select">
          <div>
            <h5 className="col fw-bold m-0 word-break">{title}</h5>
            <p className="ts-9 my-1">
              {community} community ({duration})
            </p>
          </div>
          <p className="ts-6 m-0">{session || "ALIPAY NOT SET"}</p>
          <p className="ts-9 m-0 text-warning">Rp.{balanceDisplay || balance || " - "}</p>
        </div>
      </div>
      <hr />
    </>
  )
}
