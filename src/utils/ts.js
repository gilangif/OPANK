export default function timestamp(time, type) {
  const a = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }
  const b = { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
  const c = { weekday: "long", day: "2-digit", month: "long", year: "numeric", ...a }

  const date = time ? (isNaN(new Date(time).getTime()) ? new Date() : new Date(time)) : new Date()
  const opt = type === "time" ? a : type === "date" ? b : c

  return new Intl.DateTimeFormat("id-ID", opt).format(date).replace("pukul ", "").replace(/\./g, ":")
}
