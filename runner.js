import { createServer } from "vite"

const port = 3006

async function start() {
  const server = await createServer({
    server: { port, host: true },
  })
  await server.listen()
  console.log(`# REACT RUN ON http://localhost:${port}`)
}

start()
