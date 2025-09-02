export default function SheetList({ icon, title, fill, color, rightIcon, border, onClick }) {
  return (
    <>
      <div className="d-flex flex-row gap-1 disable-select sheet-list-card" onClick={onClick}>
        <div className="sheet-list-icon-box">
          <span className={`material-symbols-outlined ${color || ""}`} style={{ scale: "1.1", fontVariationSettings: fill ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "" }}>
            {icon}
          </span>
        </div>

        <div className="col d-flex align-items-center">
          <p className={`ts-8 m-0 text-uppercase text-light ${fill ? "fw-bold" : ""}`}>{title}</p>
        </div>

        {rightIcon ? (
          <div className="px-2">
            <span className="material-symbols-outlined" style={{ scale: "1.1", fontVariationSettings: fill ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "" }}>
              {rightIcon}
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
      {border ? <hr className="m-1" /> : ""}
    </>
  )
}
