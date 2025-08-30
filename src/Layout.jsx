import { Outlet } from "react-router-dom"
import Nav from "./components/Nav"

export default function Layout() {
  return (
    <div className="layout">
      <Nav />
      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}
