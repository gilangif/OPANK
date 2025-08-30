import { useSearchParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { dispatchClaim } from "../../features/configSlice"
import { logout } from "../../features/authSlice"
import { API, API_V2, DEFAULT_IMAGE } from "../../config"

import timestamp from "../../utils/ts"
import ButtonFloat from "../ButtonFloat"

import axios from "axios"

const today = new Date()
const localIso = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-")

export default function ClaimContainer() {
  const [isOpen, setOpen] = useState(false)
  const [claimsFilter, setClaimsFilter] = useState({ models: [], nicknames: [], communities: [], types: [], usernames: [] })

  const [page, setPage] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")

  const [sort, setSort] = useState(() => searchParams.get("sort") || "desc")
  const [limit, setLimit] = useState(() => searchParams.get("limit") || 50)
  const [model, setModel] = useState(() => searchParams.get("model") || "")
  const [community, setCommunity] = useState(() => searchParams.get("community") || "")
  const [type, setType] = useState(() => searchParams.get("type") || "")
  const [date, setDate] = useState(() => searchParams.get("date") || "")

  const { accessToken, username, community: uc, role, avatar } = useSelector((state) => state.auth)
  const { users, devices, claims } = useSelector((state) => state.config)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getClaims = async () => {
    try {
      const params = { page, search, sort, limit, model, community, type, date }

      const { data: claims } = await axios.get(API + "/claims", { headers: { Authorization: `Bearer ${accessToken}` }, params })
      const { currentPage, totalPages, totalRow, limit: claimLimit, sort: claimSort, data } = claims

      dispatch(dispatchClaim(data))

      setTotalData(totalRow)
      setTotalPages(totalPages)

      const obj = { page: currentPage }

      if (search) obj.search = search
      if (sort) obj.sort = sort
      if (limit) obj.limit = limit
      if (model) obj.model = model
      if (community) obj.community = community
      if (type) obj.type = type
      if (date) obj.date = date

      setSearchParams(obj)
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

  const getFilters = async () => {
    try {
      const { data } = await axios.get(API + "/claims/filters", { headers: { Authorization: `Bearer ${accessToken}` } })
      setClaimsFilter(data)
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

  const searchData = async (e) => {
    e.preventDefault()
    setPage(1)
    getClaims()
  }

  const filter = (clear) => {
    setOpen(false)

    if (clear) {
      setPage(1)
      setLimit(50)
      setSort("desc")
      setModel("")
      setCommunity("")
      setType("")
      setDate("")
      setSearch("")

      setSearchParams({})
      return
    }

    setPage(1)
    getClaims()
  }

  const PaginationContainer = () => {
    const maxButtons = 2
    const pages = []

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      const middle = Math.min(Math.max(page - 1, 2), totalPages - 3)
      pages.push(1)

      for (let i = middle; i <= middle + 2 && i < totalPages; i++) pages.push(i)

      pages.push(totalPages)
    }
    return (
      <div className="d-flex justify-content-center my-5 gap-2">
        <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        {pages.map((p, i) => {
          return (
            <button key={i} className={`btn fw-bold ${p === page ? "btn-warning" : ""}`} onClick={() => setPage(p)}>
              {p}
            </button>
          )
        })}

        <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (searchParams.get("search")) setSearch(searchParams.get("search"))
    if (searchParams.get("sort")) setSort(searchParams.get("sort"))
    if (searchParams.get("model")) setModel(searchParams.get("model"))
    if (searchParams.get("community")) setCommunity(searchParams.get("community"))
    if (searchParams.get("type")) setType(searchParams.get("type"))
    if (searchParams.get("date")) setDate(searchParams.get("date"))

    if (searchParams.get("page")) setPage(parseInt(searchParams.get("page")) || 1)
    if (searchParams.get("limit")) setLimit(parseInt(searchParams.get("limit")) || 10)
  }, [searchParams])

  useEffect(() => {
    getClaims()
  }, [page, searchParams])

  useEffect(() => {
    getFilters()
  }, [])

  return (
    <>
      <div className="col">
        <div className="d-flex flex-column justify-content-between  disable-select py-3">
          <h5 className="py-2 fw-bold m-0">Claim history</h5>
          <p className="ts-9 m-0">
            {totalData} data from {totalPages} pages
          </p>
        </div>

        <form onSubmit={(e) => searchData(e)}>
          <div className="input-group py-3 mb-3">
            <input type="text" className="form-control py-2" placeholder="Search something" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-outline-secondary text-light" type="submit" id="button-addon1">
              SEARCH
            </button>
          </div>
        </form>

        <PaginationContainer />

        <div className="table-responsive w-100 hide-scroll">
          <table className="table table-md align-middle">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">MODEL</th>
                <th scope="col">CLAIM</th>
                <th scope="col">ORDERID</th>
                <th scope="col">CODE</th>
                <th scope="col">AMOUNT</th>
                <th scope="col">GROUP</th>
                <th scope="col">COMMUNITY</th>
                <th scope="col">TYPE</th>
                <th scope="col">DATE</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((x, i) => {
                const { id, order_id, code, claim, amount, type, group_id, group_username, group_title, model, community, created_at, updated_at } = x

                return (
                  <tr key={i}>
                    <td scope="row">{i + 1}</td>
                    <td className={`text-uppercase ${community === uc ? "text-warning" : ""}`}>{model}</td>
                    <td className="text-uppercase">{claim}</td>
                    <td className="text-uppercase">{order_id}</td>
                    <td>
                      <a href={`https://link.dana.id/kaget?c=${code}`} className="text-uppercase">
                        {code}
                      </a>
                    </td>
                    <td className={`text-uppercase ${community === uc ? "text-warning" : ""}`}>{amount}</td>
                    <td className="text-uppercase">{group_title}</td>
                    <td className={`text-uppercase ${community === uc ? "text-warning" : ""}`}>{community}</td>
                    <td className="text-uppercase">{type}</td>
                    <td className="text-uppercase">{timestamp(created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <PaginationContainer />
      </div>

      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark">
          <Sheet.Header className="px-3 py-2">
            <div className="d-flex text-light">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h6 className="m-0">CLAIMS FILTER</h6>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => filter(true)}>
                  reset_settings
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => filter()}>
                  filter_alt
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3 py-2 p-lg-3">
            <div className="py-3">
              <div className="input-group mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  DATE
                </label>
                <input type="date" className="form-control" placeholder="" min="1" value={date || localIso} onChange={(e) => setDate(e.target.value)}></input>
              </div>

              <div className="input-group mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  SORT
                </label>
                <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="desc">DESC</option>
                  <option value="asc">ASC</option>
                </select>
              </div>

              <div className="input-group mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  MODEL
                </label>
                <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="">ALL MODEL</option>

                  {claimsFilter.models.map((x, i) => {
                    return (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="input-group mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  COMMUNITY
                </label>
                <select className="form-select" value={community} onChange={(e) => setCommunity(e.target.value)}>
                  <option value="">ALL COMMUNITY</option>

                  {claimsFilter.communities.map((x, i) => {
                    return (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="input-group mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  TYPE
                </label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">ALL TYPE</option>

                  {claimsFilter.types.map((x, i) => {
                    return (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="input-group mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  LIMIT
                </label>
                <input type="number" className="form-control" placeholder="" min="1" value={limit} onChange={(e) => setLimit(e.target.value)}></input>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setOpen(false)} />
      </Sheet>

      {claimsFilter.models.length > 0 ? <ButtonFloat icon="sort" color="text-dark" background="bg-warning" onClick={() => setOpen(true)} /> : ""}
    </>
  )
}
