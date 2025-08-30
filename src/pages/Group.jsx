import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { API, API_V2, DEFAULT_IMAGE } from "../config"

import ButtonFloat from "../components/ButtonFloat"
import GroupCard from "../components/group/GroupCard"

import axios from "axios"

export default function Group() {
  const [isOpen, setOpen] = useState(false)

  const [lists, setLists] = useState([])
  const [mark, setMark] = useState(0)
  const [unmark, setUnmark] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalData, setTotalData] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")

  const [page, setPage] = useState(() => parseInt(searchParams.get("page")) || 1)
  const [limit, setLimit] = useState(() => parseInt(searchParams.get("limit")) || 25)
  const [sort, setSort] = useState(() => searchParams.get("sort") || "desc")
  const [order, setOrder] = useState(() => searchParams.get("order") || "")
  const [key, setKey] = useState(() => searchParams.get("key") || "")

  const { accessToken, username, role, avatar } = useSelector((state) => state.auth)

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

  const filter = (clear) => {
    setOpen(false)

    if (clear) {
      setPage(1)
      setLimit(25)
      setSort("desc")
      setOrder("")
      setSearch("")

      setSearchParams({})
      return
    }

    setPage(1)
    getGroups()
  }

  const searchData = async (e) => {
    e.preventDefault()
    setPage(1)
    getGroups()
  }

  const getGroups = async () => {
    try {
      const params = { page, limit, sort, order, key, search }

      const { data: groups } = await axios.get(API_V2 + "/telegram/groups", { params })
      const { data, total, page: currentPage, pages, unmark, mark } = groups

      setLists(data)
      setMark(mark)
      setUnmark(unmark)
      setTotalData(total)
      setTotalPages(pages)

      const obj = { page: currentPage }

      if (search) obj.search = search
      if (sort) obj.sort = sort
      if (order) obj.order = order
      if (limit) obj.limit = limit
      if (key) obj.key = key

      setSearchParams(obj)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-right", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  useEffect(() => {
    if (searchParams.get("search")) setSearch(searchParams.get("search"))
    if (searchParams.get("sort")) setSort(searchParams.get("sort"))
    if (searchParams.get("order")) setOrder(searchParams.get("order"))
    if (searchParams.get("key")) setKey(searchParams.get("key"))

    if (searchParams.get("page")) setPage(parseInt(searchParams.get("page")) || 1)
    if (searchParams.get("limit")) setLimit(parseInt(searchParams.get("limit")) || 25)
  }, [searchParams])

  useEffect(() => {
    getGroups()
  }, [page, searchParams])

  return (
    <>
      <div className="p-2">
        <div className="alert alert-light ts-9 disable-select" role="alert">
          <h6 className="alert-heading text-warning">Success load {lists.length} group data</h6>
          <p className="my-1">
            Total {totalData} group data from {totalPages} pages.
          </p>
          <hr />
          <p className="m-0">
            {mark} marked, {unmark} unmarked
          </p>
        </div>
      </div>

      <div className="px-3">
        <form onSubmit={(e) => searchData(e)}>
          <div className="input-group py-3 mb-3">
            <input type="text" className="form-control py-2" value={search} placeholder="Search something" onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-outline-secondary text-light" type="submit" id="button-addon1">
              SEARCH
            </button>
          </div>
        </form>
      </div>

      <PaginationContainer />

      <div className="p-3 mt-4">
        <div className="masonry">
          {lists.map((x, i) => (
            <GroupCard key={i} props={x} />
          ))}
        </div>
      </div>

      <PaginationContainer />

      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} disableDrag={true} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header className="px-3 py-2">
            <div className="d-flex">
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
          <Sheet.Content className="px-3">
            <div className="input-group mb-3">
              <label className=" disable-select input-group-text" style={{ width: "25%" }}>
                SORT
              </label>
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">SORT</option>
                <option value="desc">DESC</option>
                <option value="asc">ASC</option>
              </select>
            </div>
            <div className="input-group mb-3">
              <label className=" disable-select input-group-text" style={{ width: "25%" }}>
                ORDER
              </label>
              <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
                <option value="">ORDER</option>
                <option value="mark">MARK</option>
                <option value="unmark">UNMARK</option>
                <option value="joined">JOINED</option>
              </select>
            </div>
            <div className="input-group mb-3">
              <label className=" disable-select input-group-text" style={{ width: "25%" }}>
                KEY
              </label>
              <select className="form-select" value={key} onChange={(e) => setKey(e.target.value)}>
                <option value="">ACCOUNT</option>
                <option value="one">ONE</option>
                <option value="two">TWO</option>
                <option value="three">THREE</option>
                <option value="four">FOUR</option>
                <option value="five">FIVE</option>
                <option value="six">SIX</option>
                <option value="seven">SEVEN</option>
                <option value="eight">EIGHT</option>
                <option value="nine">NINE</option>
                <option value="ten">TEN</option>
              </select>
            </div>
            <div className="input-group mb-3">
              <label className=" disable-select input-group-text" style={{ width: "25%" }}>
                LIMIT
              </label>
              <input type="number" className="form-control" placeholder="" min="1" value={limit} onChange={(e) => setLimit(e.target.value)}></input>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>

      <ButtonFloat icon="tune" background="bg-success" onClick={() => setOpen(true)} />
    </>
  )
}
