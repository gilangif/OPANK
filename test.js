import { createServer, loadConfigFromFile, mergeConfig } from "vite"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = 3006

async function start() {
  const { config } = await loadConfigFromFile({ command: "serve", mode: "development" }, path.resolve(__dirname, "vite.config.js"))

  const server = await createServer(
    mergeConfig(config, {
      server: { port, host: true },
    })
  )

  await server.listen()
  console.log(`# REACT RUN ON http://localhost:${port}`)
}

start()
