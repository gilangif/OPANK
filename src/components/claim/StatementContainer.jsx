import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState, useRef } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { Card, CardContent, Typography } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"

import { dispatchStatement } from "../../features/configSlice.js"
import { API, API_V2, DEFAULT_IMAGE } from "../../config"

import saveFile from "../../utils/saveFile.js"

import axios from "axios"

const today = new Date()
const localIso = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-")

const ChartContainer = ({ props }) => {
  const [isOpen, setOpen] = useState(false)
  const [detail, setDetail] = useState({ type: "", today: 0, month: 0, summary: [] })

  const { today, mtd, summary } = props

  const ta = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(today.amount)
  const ma = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(mtd.amount)

  const showSummary = (data) => {
    setDetail(data)
    setOpen(true)
  }

  const obj = {
    type: "monthly statement all",
    today: ta,
    mtd: ma,
    summary: summary.map(({ day, amount, percentage, total, claim }) => ({ day, amount: new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(amount), percentage, total, claim })),
  }

  return (
    <div className="disable-select mb-3">
      <Card sx={{ width: "100%", background: "transparent", boxShadow: "none", border: "none" }}>
        <CardContent className="p-0 disable-select">
          <Typography gutterBottom className="text-light">
            Monthly Statement
          </Typography>
          <div onClick={() => showSummary(obj)}>
            <span className="text-light fw-bold" style={{ marginRight: "8px" }}>
              TODAY:
            </span>
            <span className="text-light">
              Rp.{ta} ({today.total} transcation)
            </span>
          </div>
          <div>
            <span className="text-light fw-bold" style={{ marginRight: "8px" }}>
              MTD:
            </span>
            <span className="text-light">
              Rp.{ma} ({mtd.total} transcation)
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" interval={0} className="ts-6" />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === "day") return [value, "Statement"]
                  return [value, name]
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload
                    return (
                      <div style={{ background: "#333", color: "#fff", padding: "5px", borderRadius: "4px" }} className="ts-8">
                        <div>Date: {dataPoint.day}</div>
                        <div>Claim: {dataPoint.claim}</div>
                        <div>Total: {dataPoint.total}</div>
                        <div>Amount: {new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(dataPoint.amount)}</div>
                        <div>Percentage: {dataPoint.percentage > 0 ? dataPoint.percentage.toFixed(1) : 0}%</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#ffc107" name="Summary" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark">
          <Sheet.Header className="p-3">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h6 className="m-0 text-uppercase">SUMMARY {detail.type}</h6>
                <p className="m-0">TOTAL RP {detail.mtd}</p>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => saveFile(detail)}>
                  download
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3 py-2 p-lg-3">
            <div className="table-responsive hide-scroll disable-select w-100">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">AMOUNT</th>
                    <th scope="col">CLAIM</th>
                    <th scope="col">TOTAL</th>
                    <th scope="col">PERCENTAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.summary.map((x, i) => {
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>RP {x.amount}</td>
                        <td>{x.claim}</td>
                        <td>{x.total}</td>
                        <td>{x.percentage > 0 ? x.percentage.toFixed(1) : 0}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setOpen(false)} />
      </Sheet>
    </div>
  )
}

export default function StatementContainer() {
  const inputRef = useRef(null)

  const [isOpen, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  const [detail, setDetail] = useState({ type: "", today: 0, month: 0, summary: [] })
  const [statementDate, setStatementDate] = useState(localIso)
  const [date, setDate] = useState(localIso)

  const { accessToken, username, community, role, avatar } = useSelector((state) => state.auth)
  const { users, devices, claims, statementList } = useSelector((state) => state.config)

  const dispatch = useDispatch()

  const filterStatement = () => {
    const [y, m, d] = statementDate.split("-")
    const [year, month, day] = date.split("-")

    const obj = { ...statementList, global: {}, model: {}, community: {}, type: {} }

    if (y === year && m === month && d !== day) {
      const arr = ["global", "model", "community", "type"]

      arr.forEach((key) => {
        if (key === "global") {
          const today = statementList[key].summary.find((x) => x.day === parseInt(d))
          return (obj[key] = { ...statementList[key], today })
        }

        Object.keys(statementList[key]).forEach((subkey) => {
          const today = statementList[key][subkey].summary.find((x) => x.day === parseInt(d))
          return (obj[key][subkey] = { ...statementList[key][subkey], today })
        })
      })

      dispatch(dispatchStatement(obj))
    } else {
      getStatement()
    }
  }

  const getStatement = async () => {
    setLoading(true)
    setShowFilter(false)

    try {
      const { data } = await axios.get(API + "/claims/statement", { headers: { Authorization: `Bearer ${accessToken}` }, params: { date: statementDate } })

      setDate(statementDate)
      dispatch(dispatchStatement(data))
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      setLoading(false)
      setShowFilter(false)
    }
  }

  const showSummary = (data) => {
    setDetail(data)
    setOpen(true)
  }

  useEffect(() => {
    if (!statementList.global) getStatement()
  }, [])

  const handleClick = () => inputRef.current.showPicker?.()

  return (
    <>
      <div className="d-flex gap-3">
        <h1 className="disable-select m-0" onClick={handleClick}>
          {statementDate || localIso}
        </h1>

        {showFilter ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <h1 className="material-symbols-outlined m-0 p-0 disable-select" onClick={() => filterStatement()}>
              filter_alt
            </h1>
          </div>
        ) : (
          ""
        )}

        {loading ? (
          <div className="d-flex align-items-center p-0 m-0">
            <div className="spinner-border" style={{ scale: 0.8 }} role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : (
          ""
        )}

        <input
          ref={inputRef}
          type="date"
          value={statementDate}
          onChange={(e) => {
            setStatementDate(e.target.value)
            setShowFilter(true)
          }}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        />
      </div>

      <div className="col flex-grow-1 d-flex flex-column py-1">
        {Object.keys(statementList).map((key, i) => {
          if (key == "owner") return

          if (key === "global") return <ChartContainer key={i} props={statementList[key]} />

          const owner = statementList["owner"]
          const data = Object.keys(statementList[key])
            .map((name) => ({ name, ...statementList[key][name] }))
            .sort((a, b) => b.today.amount - a.today.amount)

          if (data.length === 0) return

          return (
            <div key={i}>
              <div className="py-3 disable-select">
                <p className="text-uppercase fw-bold">SUMMARY BY {key}</p>

                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">NAME</th>
                      <th scope="col">TODAY</th>
                      <th scope="col">MTD</th>
                      <th scope="col">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((x, j) => {
                      const { name, today, mtd, summary } = x

                      let censor = false
                      let creator = false

                      if (key === "model" && !owner.find((y) => y === name)) {
                        censor = true
                        creator = true
                      }

                      if (key === "community" && name !== community) {
                        censor = true
                        creator = true
                      }

                      if (key === "type") censor = false
                      if (role === "admin") censor = false

                      const ta = censor ? String(today.amount).replace(/./g, "*") : new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(today.amount)
                      const ma = censor ? String(mtd.amount).replace(/./g, "*") : new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(mtd.amount)

                      let nm = ""

                      if (censor && /^[0-9]+$/.test(name)) {
                        for (let z = 0; z < name.length; z++) {
                          if (z > 3 && z <= 7) nm += "*"
                          else nm += name[z]
                        }
                      } else {
                        nm = name
                      }

                      const obj = {
                        type: `${key} ${name}`,
                        today: ta,
                        month: ma,
                        summary: summary.map(({ amount, percentage, total, claim }) => ({
                          amount: censor ? String(amount).replace(/./g, "*") : new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(amount),
                          percentage,
                          total,
                          claim,
                        })),
                      }

                      return (
                        <tr key={j} onClick={() => showSummary(obj)}>
                          <td className="text-uppercase">{j + 1}</td>
                          <td className={`text-uppercase ${creator ? "" : "fw-bold text-warning"}`}>{nm.split(" ").slice(0, 3).join(" ")}</td>
                          <td className="text-uppercase">RP {ta}</td>
                          <td className="text-uppercase">RP {ma}</td>
                          <td className="text-uppercase">{today.percentage ? today.percentage.toFixed(2) : 0}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent="content-height" className="custom-sheet">
                <Sheet.Container className="bg-dark">
                  <Sheet.Header className="p-3">
                    <div className="d-flex">
                      <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                        <h6 className="m-0 text-uppercase">SUMMARY {detail.type}</h6>
                        <p className="m-0">TOTAL RP {detail.mtd}</p>
                      </div>
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <span className="material-symbols-outlined p-2 fw-bold" onClick={() => saveFile(detail)}>
                          download
                        </span>
                        <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                          close
                        </span>
                      </div>
                    </div>
                  </Sheet.Header>

                  <Sheet.Content className="px-3 py-2 p-lg-3">
                    <div className="table-responsive hide-scroll disable-select w-100">
                      <table className="table">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">AMOUNT</th>
                            <th scope="col">CLAIM</th>
                            <th scope="col">TOTAL</th>
                            <th scope="col">PERCENTAGE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.summary.map((x, i) => {
                            return (
                              <tr key={i}>
                                <td scope="row">{i + 1}</td>
                                <td>RP {x.amount}</td>
                                <td>{x.claim}</td>
                                <td>{x.total}</td>
                                <td>{x.percentage > 0 ? x.percentage.toFixed(1) : 0}%</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setOpen(false)} />
              </Sheet>
            </div>
          )
        })}
      </div>
    </>
  )
}
