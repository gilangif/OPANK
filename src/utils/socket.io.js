import { io as ioclient } from "socket.io-client"
import { API, API_V2, DEFAULT_IMAGE } from "../config"

const socket = ioclient(API, { autoConnect: false, reconnection: true, reconnectionAttempts: Infinity })

export default socket
