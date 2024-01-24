import '@testing-library/jest-dom'
import 'whatwg-fetch'

import { mswServer } from 'uiSrc/mocks/server'

export const URL = 'URL'
window.URL.revokeObjectURL = () => {}
window.URL.createObjectURL = () => URL

beforeAll(() => {
  mswServer.listen()
})

afterEach(() => {
  mswServer.resetHandlers()
})

afterAll(() => {
  // server.printHandlers()
  mswServer.close()
})
