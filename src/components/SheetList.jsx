export default function SheetList({ icon, title, fill, color, onClick }) {
  return (
    <div className="d-flex flex-row gap-2 disable-select sheet-list-card py-1" onClick={onClick}>
      <div className="sheet-list-icon-box">
        <span className={`material-symbols-outlined ${color || ""}`} style={{ fontVariationSettings: fill ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "" }}>
          {icon}
        </span>
      </div>

      <div className="col d-flex align-items-center">
        <p className="ts-8 m-0 text-uppercase text-light">{title}</p>
      </div>
    </div>
  )
}
