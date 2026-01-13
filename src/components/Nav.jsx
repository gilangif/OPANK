import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, Link } from "react-router-dom"

function NavItems({ to, icon, active }) {
  return (
    <div className="text-center">
      <Link to={to}>
        <span className={`navbar-icon material-symbols-outlined p-3 disable-select ${active ? "text-warning" : ""}`}>{icon}</span>
      </Link>
    </div>
  )
}

export default function Nav() {
  const location = useLocation()

  const items = [
    { to: "/", icon: "home" },
    { to: "/chats", icon: "chat" },
    { to: "/monitor", icon: "pets" },
    { to: "/claims", icon: "acute" },
    { to: "/others", icon: "build" },
  ]

  return (
    <nav className="navbar fixed-bottom navbar-dark bg-dark p-1 p-lg-0 px-lg-3" style={{ borderRadius: "1.1rem 1.1rem 0 0" }}>
      <div className="d-flex justify-content-around justify-content-lg-start align-items-center gap-2 gap-lg-4 w-100 px-2 py-1">
        {items.map((x, i) => {
          const { to, icon } = x
          const active = location.pathname === x.to
          return <NavItems key={i} to={to} icon={icon} active={active} />
        })}
      </div>
    </nav>
  )
}
