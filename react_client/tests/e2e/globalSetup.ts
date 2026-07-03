
import { spawn } from 'child_process'
import { request, expect } from '@playwright/test'
import './fixtures'

let backendProcess: any

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

export default async function globalSetup() {
  console.log('Starting backend...')

  backendProcess = spawn(
    '..\\fastapi_server\\venv\\Scripts\\python.exe',
    [
      '-m',
      'uvicorn',
      'app.main:app',
    ],
    {
      cwd: '..//fastapi_server',
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        ENVIRONMENT: 'test',
      },
    }
  )

  const api = await request.newContext({
    baseURL: process.env.VITE_SERVER_URL,
  })

  let ok = false

  for (let i = 0; i < 20; i++) {
    try {
      const res = await api.get('/health')
      if (res.ok()) {
        ok = true
        console.log("RES:", res.url(), res.statusText())
        break
      }
    } catch {}

    await sleep(500)
  }

  expect(ok).toBeTruthy()

  const res = await api.post('/test/reset-db')
  console.log("RES:", res.url(), res.statusText())
  expect(res.ok()).toBeTruthy()
  console.log('Backend Connected')

}