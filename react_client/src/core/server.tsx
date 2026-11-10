
import type { Server } from "@/interfaces/server"
import { httpImplementation } from "@/implementations/server/http"
import { mockImplementation } from "@/implementations/server/mock"

import { config } from "./config"

let server: Server

switch (config.VITE_SERVER_IMPLEMENTATION) {
    case "http":
        server = httpImplementation
        break
    case "mock":
        server = mockImplementation
        break
    default:
        throw new Error(`Unknown server implementation: ${config.VITE_SERVER_IMPLEMENTATION}`)
}

export { server }