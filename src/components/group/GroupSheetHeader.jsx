import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import { API, API_V2, DEFAULT_IMAGE } from "../../config"

import timestamp from "../../utils/ts"

export default function GroupSheetHeader({ props }) {
  return (
    <>
      <div className="d-flex flex-row gap-3">
        <div className="sheet-thumb-box flex-shrink-0">
          <img
            src={props.photo || DEFAULT_IMAGE}
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
            <h5 className="col fw-bold m-0 word-break">{props.title}</h5>
            <p className="ts-8 my-1">{timestamp(props.date)}</p>
          </div>
          <p className="ts-8 m-0">{props.extra}</p>
          <p className="ts-9 m-0 text-warning">{props.url}</p>
        </div>
      </div>
      <hr />
    </>
  )
}
