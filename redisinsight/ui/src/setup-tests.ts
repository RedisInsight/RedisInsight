import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
// import { TextDecoder, TextEncoder } from 'text-encoding'
// import { TextEncoder, TextDecoder } from 'util'

import { mswServer } from 'uiSrc/mocks/server'

export const URL = 'URL'
window.URL.revokeObjectURL = () => {}
window.URL.createObjectURL = () => URL

// global.TextDecoder = TextDecoder
// global.TextDecoder = { prototype: TextDecoder }
// global.TextEncoder = TextEncoder

// Object.assign(global, { TextDecoder, TextEncoder })

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
