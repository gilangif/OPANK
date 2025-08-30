const saveFile = async (data) => {
  const filename = `${Date.now()}.json`
  const content = typeof data === "object" ? JSON.stringify(data, null, 2) : data
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
}

export default saveFile
