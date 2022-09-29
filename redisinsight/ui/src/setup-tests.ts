import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'

import { mswServer } from 'uiSrc/mocks/server'

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
