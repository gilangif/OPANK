import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { ToastContainer, toast } from "react-toastify"
import { Card, CardContent, Typography } from "@mui/material"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

import { API, API_V2, DEFAULT_IMAGE } from "../config"

import axios from "axios"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#06e25aff", "#221e1dff", "#be2082ff"]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }} className="ts-8 p-2 rounded">
        <p className="my-1 mx-0">Name: {data.name}</p>
        <p className="my-1 mx-0">ID: {data.id}</p>
        <p className="my-1 mx-0">PID: {data.pid}</p>
        <p className="my-1 mx-0">Used: {data.used.toFixed(2)} MB</p>
      </div>
    )
  }
  return null
}

export default function Monitor() {
  const [platform, setPlatform] = useState("platform")
  const [lists, setLists] = useState([{ name: "Unknown", id: 0, pid: 0, used: 1 }])
  const [memory, setMemory] = useState({ total: 0, used: 0, percentage: 0 })
  const [cpus, setCpus] = useState([])
  const [swap, setSwap] = useState({ total: 0, free: 0, used: 0, percentage: 0 })

  useEffect(() => {
    const getSystem = async () => {
      try {
        const { data } = await axios(API + "/monitor")
        const { platform, memory, cpus, swap, lists } = data

        setPlatform(platform)
        setMemory(memory)
        setCpus(cpus)
        setSwap(swap)

        if (lists.length > 0) setLists(lists.map((x) => ({ ...x, used: Math.round(x.used) })))
      } catch (error) {
        const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

        console.log(error)
        toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
      }
    }

    getSystem()
  }, [])

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center py-3 disable-select">
        <div className="py-4 text-center">
          <h3 className="fw-bold text-uppercase">{platform}</h3>
          <p className="fs-8 m-1">
            CPU {cpus.length} CORE (
            {cpus
              .map((x) => x.used)
              .reduce((a, b) => a + b, 0)
              .toFixed(1)}
            %)
          </p>
          <p className="fs-8 m-1">
            SWAP {Math.round(swap.used)} / {Math.round(swap.total)} MB ({swap.percentage.toFixed(1)}%)
          </p>
          <p className="fs-8 m-1">
            RAM {Math.round(memory.used)} / {Math.round(memory.total)} MB ({memory.percentage.toFixed(1)}%)
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300} style={{ background: "transparent" }}>
          <PieChart style={{ background: "transparent" }}>
            <Pie data={lists} dataKey="used" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {lists.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <div className="table-responsive w-100 px-3 py-5">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">NAME</th>
                <th scope="col">PM2 ID</th>
                <th scope="col">PID</th>
                <th scope="col">USED</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((x, i) => {
                const { name, id, pid, used } = x

                return (
                  <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    <td>{name}</td>
                    <td>{id}</td>
                    <td>{pid}</td>
                    <td>{used} MB</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
