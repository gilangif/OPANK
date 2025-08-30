export default function ButtonFloat({ icon, color, background, onClick }) {
  return (
    <>
      <div className={`float-btn ${background || "bg-success"} ${color || "text-light"} disable-select`} onClick={onClick}>
        <span className="material-symbols-outlined disable-select">{icon}</span>
      </div>
    </>
  )
}
